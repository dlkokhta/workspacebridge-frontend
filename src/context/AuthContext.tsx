import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_URL;

// Reads the non-httpOnly csrfToken cookie set by the backend so it can be
// echoed back in the X-CSRF-Token header (double-submit CSRF protection on
// the cookie-authenticated refresh/logout endpoints).
export const getCsrfToken = (): string => {
  const match = document.cookie.match(/(?:^|;\s*)csrfToken=([^;]+)/);
  return match ? decodeURIComponent(match[1]) : "";
};

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  withCredentials: true,
  headers: { "X-Requested-With": "XMLHttpRequest" },
});

interface AuthContextType {
  accessToken: string | null;
  setAccessToken: (token: string | null) => void;
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  accessToken: null,
  setAccessToken: () => {},
  isLoading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const tokenRef = useRef<string | null>(null);
  const refreshPromiseRef = useRef<Promise<string | null> | null>(null);

  const setAccessToken = useCallback((token: string | null) => {
    tokenRef.current = token;
    setAccessTokenState(token);
  }, []);

  // Single source of truth for refreshing the access token. Dedups every
  // caller — the initial page-load bootstrap, any number of concurrent 401s,
  // and React StrictMode's double effect invocation in dev — onto one in-flight
  // /auth/refresh. Two concurrent refreshes would rotate the refresh token
  // against itself and the backend would revoke the session as suspected reuse,
  // logging the user out on what looked like a simple page refresh.
  const refreshAccessToken = useCallback((): Promise<string | null> => {
    if (refreshPromiseRef.current) return refreshPromiseRef.current;

    const promise = axios
      .post(
        `${BASE_URL}/auth/refresh`,
        {},
        {
          withCredentials: true,
          headers: {
            "X-Requested-With": "XMLHttpRequest",
            "X-CSRF-Token": getCsrfToken(),
          },
        },
      )
      .then((res) => {
        const newToken: string = res.data.accessToken;
        setAccessToken(newToken);
        return newToken;
      })
      .catch((): string | null => {
        // No valid session (logged-out visitor or expired refresh). Callers
        // that need an authed token handle the null; public pages just ignore.
        setAccessToken(null);
        return null;
      })
      .finally(() => {
        refreshPromiseRef.current = null;
      });

    refreshPromiseRef.current = promise;
    return promise;
  }, [setAccessToken]);

  // Setup interceptors once
  useEffect(() => {
    const requestInterceptor = axiosInstance.interceptors.request.use((config) => {
      if (tokenRef.current) {
        config.headers.Authorization = `Bearer ${tokenRef.current}`;
      }
      const csrf = getCsrfToken();
      if (csrf) {
        config.headers["X-CSRF-Token"] = csrf;
      }
      return config;
    });

    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (
          error.response?.status === 401 &&
          originalRequest &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;
          const newToken = await refreshAccessToken();
          if (newToken) {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosInstance(originalRequest);
          }
          // Refresh failed — the session is gone; send the user to login.
          window.location.href = "/login";
        }
        return Promise.reject(error);
      },
    );

    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, [refreshAccessToken]);

  // Bootstrap: adopt an existing session (if any) on first load.
  useEffect(() => {
    refreshAccessToken().finally(() => setIsLoading(false));
  }, [refreshAccessToken]);

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
