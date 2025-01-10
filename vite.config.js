import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

// https://vite.dev/config/
export default defineConfig({
  server: {
    proxy: {
      "/api": {
        target: "https://mern-estate-1-q6ie.onrender.com", // Domain đã deploy
        changeOrigin: true, // Thay đổi origin khi gửi request
        secure: true, // Vì bạn sử dụng HTTPS
      },
    },
  },
  plugins: [react()],
});
