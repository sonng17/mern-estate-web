import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000", // Dùng cho môi trường development
        secure: false,
      },
    },
  },
  define: {
    "process.env.VITE_API_BASE_URL": JSON.stringify(
      // eslint-disable-next-line no-undef
      process.env.VITE_API_BASE_URL || "http://localhost:3000"
    ),
  },
  plugins: [react()],
});
