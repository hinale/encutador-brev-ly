export const SHORT_URL_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export function isValidShortUrl(value: string): boolean {
  return SHORT_URL_PATTERN.test(value)
}
