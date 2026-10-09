export class InvalidShortUrlError extends Error {
  constructor() {
    super('Invalid short URL')
    this.name = 'InvalidShortUrlError'
  }
}
