/** Vite deploy base. Always trailing slash: "/" locally, "/wonguk/" on GH Pages. */
export function baseUrl() {
  const raw = import.meta.env.BASE_URL || "/";
  return raw.endsWith("/") ? raw : `${raw}/`;
}

/** Prefix a root-relative app path ("/", "/method") with the deploy base. */
export function withBase(path) {
  const base = baseUrl();
  if (!path || path === "/") {
    return base === "/" ? "/" : base;
  }
  const rest = path.startsWith("/") ? path.slice(1) : path;
  return `${base}${rest}`;
}

/** Strip the deploy base so app routes stay "/", "/method", "/privacy", "/terms". */
export function normalizePath(pathname) {
  let p = pathname || "/";
  const base = baseUrl();
  if (base !== "/") {
    const trimmed = base.slice(0, -1);
    if (p === trimmed || p === base) {
      p = "/";
    } else if (p.startsWith(base)) {
      p = `/${p.slice(base.length)}`;
    } else if (p.startsWith(`${trimmed}/`)) {
      p = p.slice(trimmed.length);
    }
  }
  if (p.endsWith("/index.html")) {
    p = p.slice(0, -"/index.html".length) || "/";
  }
  if (p === "/index.html") return "/";
  if (p.length > 1 && p.endsWith("/")) p = p.slice(0, -1);
  return p || "/";
}
