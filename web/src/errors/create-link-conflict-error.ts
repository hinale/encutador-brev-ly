export class CreateLinkConflictError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'CreateLinkConflictError'
  }
}
