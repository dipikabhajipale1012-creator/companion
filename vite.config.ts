import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tsconfigPaths(),
    tailwindcss(),
    tanstackStart({
      // this repo has a custom src/server.ts (adds error-page handling
      // around the default TanStack Start handler) — point Start at it
      server: {
        entry: "./src/server.ts",
      },
    }),
    // react's plugin must come AFTER tanstackStart()
    react(),
    // lets Nitro build output Vercel can zero-config detect
    nitro(),
  ],
});
