import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl:
      process.env.CYPRESS_BASE_URL || "https://180e7ee86b80.ngrok-free.app",
    env: {
      apiUrl: "http://localhost:8090/api",
    },
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
  },
  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
  },
});
