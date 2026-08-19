import { defineConfig } from "vite";
import { readFileSync, writeFileSync, copyFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

function siteUrl() {
  return String(process.env.SITE_URL || process.env.VITE_SITE_URL || "").replace(/\/$/, "");
}

/** Rewrite sitemap <loc> with SITE_URL when set; copy index.html → 404.html for GitHub Pages. */
function staticHostPlugin() {
  return {
    name: "wunguk-static-host",
    transformIndexHtml(html) {
      const base = process.env.BASE_PATH || "/";
      const normalized = base.endsWith("/") ? base : `${base}/`;
      return html.replaceAll("__BASE_URL__", normalized);
    },
    closeBundle() {
      const dist = resolve(import.meta.dirname, "dist");
      const base = siteUrl();
      const sm = resolve(dist, "sitemap.xml");
      if (base && existsSync(sm)) {
        const src = readFileSync(sm, "utf8");
        writeFileSync(sm, src.replaceAll("<loc>/", `<loc>${base}/`));
      }
      const robots = resolve(dist, "robots.txt");
      if (base && existsSync(robots)) {
        const src = readFileSync(robots, "utf8");
        writeFileSync(robots, src.replaceAll("Sitemap: /sitemap.xml", `Sitemap: ${base}/sitemap.xml`));
      }
      const index = resolve(dist, "index.html");
      if (existsSync(index)) {
        copyFileSync(index, resolve(dist, "404.html"));
      }
    },
  };
}

export default defineConfig({
  base: process.env.BASE_PATH || "/",
  plugins: [staticHostPlugin()],
  server: {
    host: "127.0.0.1",
    port: 8787,
    strictPort: true,
  },
  preview: {
    host: "127.0.0.1",
    port: 8787,
    strictPort: true,
  },
  test: {
    environment: "node",
    include: ["tests/**/*.test.js"],
  },
});
