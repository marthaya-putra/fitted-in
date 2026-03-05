import vinext from "vinext";
import { cloudflare } from "@cloudflare/vite-plugin";
import { defineConfig, loadEnv } from "vite";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [
      vinext(),
      cloudflare({
        viteEnvironment: { name: "rsc", childEnvironments: ["ssr"] },
      }),
    ],
    define: {
      'import.meta.env.NEXT_PUBLIC_API_URL': JSON.stringify(env.NEXT_PUBLIC_API_URL),
      'import.meta.env.NEXT_PUBLIC_APP_HOST': JSON.stringify(env.NEXT_PUBLIC_APP_HOST),
    },
    server: {
      proxy: {
        "/api": {
          target: env.NEXT_PUBLIC_API_URL,
          changeOrigin: true,
        },
      },
    },
  };
});
