import path from "path";

export function findPagesDir({ cwd = process.cwd() }: { cwd?: string } = {}) {
  return path.join(cwd, "pages");
}
