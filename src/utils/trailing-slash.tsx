export function addTrailingSlash (s: string) {
  return s[s.length - 1] !== '/' && s.indexOf('?') === -1 ? s + '/' : s
}
