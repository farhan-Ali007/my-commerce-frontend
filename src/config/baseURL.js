export const BASE_URL =
  window.location.hostname === "localhost"
    ? "/api/v1" // use proxy for local dev
    : "https://etimadmart.up.railway.app/api/v1"; // use Railway backend URL for production