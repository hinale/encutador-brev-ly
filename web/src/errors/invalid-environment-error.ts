export class InvalidEnvironmentError extends Error {
  constructor(details: string) {
    super(`Invalid environment variables: ${details}`)
    this.name = 'InvalidEnvironmentError'
  }
}
