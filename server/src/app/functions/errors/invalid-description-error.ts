export class InvalidDescriptionError extends Error {
  constructor() {
    super('Invalid description')
    this.name = 'InvalidDescriptionError'
  }
}
