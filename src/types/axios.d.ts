import "axios";

// Custom flags carried on requests through the shared axiosInstance.
declare module "axios" {
  interface AxiosRequestConfig {
    /**
     * Best-effort background call (e.g. error telemetry): if the access token
     * refresh fails, reject quietly instead of redirecting the browser to
     * /login. Prevents an unauthenticated page's error from bouncing the user.
     */
    skipAuthRedirect?: boolean;
  }

  interface InternalAxiosRequestConfig {
    skipAuthRedirect?: boolean;
    /** Set by the response interceptor to prevent infinite 401 retry loops. */
    _retry?: boolean;
  }
}
