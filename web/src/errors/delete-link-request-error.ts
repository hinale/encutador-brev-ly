export class DeleteLinkRequestError extends Error {
  constructor() {
    super('Não foi possível excluir o link. Tente novamente.')
    this.name = 'DeleteLinkRequestError'
  }
}
