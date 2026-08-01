export const siteBasePath = "/Cyber-Doc";

export function sitePath(path: string) {
  if (!path.startsWith("/") || path === siteBasePath || path.startsWith(`${siteBasePath}/`)) return path;
  return `${siteBasePath}${path}`;
}
