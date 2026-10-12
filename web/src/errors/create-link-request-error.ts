export class CreateLinkRequestError extends Error {
  constructor() {
    super('Não foi possível criar o link. Tente novamente.')
    this.name = 'CreateLinkRequestError'
  }
}
