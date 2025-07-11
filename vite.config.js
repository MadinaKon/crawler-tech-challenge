import path from "path";

export default {
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 3000,
    allowedHosts: ["localhost", "127.0.0.1", "180e7ee86b80.ngrok-free.app"],
  },
};
