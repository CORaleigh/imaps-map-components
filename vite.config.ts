import { readFileSync } from "node:fs";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// expose the package.json version as %VITE_APP_VERSION% in index.html (analytics app_version)
const { version } = JSON.parse(readFileSync(new URL("./package.json", import.meta.url), "utf-8"));
process.env.VITE_APP_VERSION = version;

// https://vite.dev/config/
export default defineConfig({
  base: "/imaps-map-components/",
  plugins: [
    react()
  ],
});
