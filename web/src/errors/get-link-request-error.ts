export class GetLinkRequestError extends Error {
  constructor() {
    super('Não foi possível obter o link. Tente novamente.')
    this.name = 'GetLinkRequestError'
  }
}
