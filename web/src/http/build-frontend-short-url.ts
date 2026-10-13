const TRAILING_SLASHES = /\/+$/

export function buildFrontendShortUrl(
  frontendUrl: string,
  shortUrl: string,
): string {
  const baseUrl = frontendUrl.replace(TRAILING_SLASHES, '')

  return `${baseUrl}/${shortUrl}`
}
