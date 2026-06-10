import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
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

  const setAccessToken = (token: string | null) => {
    tokenRef.current = token;
    setAccessTokenState(token);
  };

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
        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;
          try {
            if (!refreshPromiseRef.current) {
              refreshPromiseRef.current = axios
                .post(`${BASE_URL}/auth/refresh`, {}, {
                  withCredentials: true,
                  headers: {
                    "X-Requested-With": "XMLHttpRequest",
                    "X-CSRF-Token": getCsrfToken(),
                  },
                })
                .then((res) => {
                  const newToken: string = res.data.accessToken;
                  setAccessToken(newToken);
                  return newToken;
                })
                .catch((refreshError) => {
                  setAccessToken(null);
                  window.location.href = "/login";
                  throw refreshError;
                })
                .finally(() => {
                  refreshPromiseRef.current = null;
                });
            }
            const newToken = await refreshPromiseRef.current;
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return axiosInstance(originalRequest);
          } catch {
            return Promise.reject(error);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, []);

  // Initial refresh on page load
  useEffect(() => {
    axios
      .post(`${BASE_URL}/auth/refresh`, {}, {
        withCredentials: true,
        headers: {
          "X-Requested-With": "XMLHttpRequest",
          "X-CSRF-Token": getCsrfToken(),
        },
      })
      .then((res) => setAccessToken(res.data.accessToken))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
