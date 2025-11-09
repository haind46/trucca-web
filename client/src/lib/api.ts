// API utility with automatic session handling and logout
let logoutCallback: (() => void) | null = null;

export function setLogoutCallback(callback: () => void) {
  logoutCallback = callback;
}

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const accessToken = localStorage.getItem("trucca_access_token");

  const headers = {
    ...options.headers,
    ...(accessToken && { Authorization: `Bearer ${accessToken}` }),
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Check for unauthorized (session expired)
  if (response.status === 401) {
    // Clear tokens
    localStorage.removeItem("trucca_access_token");
    localStorage.removeItem("trucca_refresh_token");

    // Call logout callback if set (will redirect to login)
    if (logoutCallback) {
      logoutCallback();
    }

    throw new Error("Session expired. Please login again.");
  }

  return response;
}
