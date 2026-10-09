export class InvalidOriginalUrlError extends Error {
  constructor() {
    super('Invalid original URL')
    this.name = 'InvalidOriginalUrlError'
  }
}
