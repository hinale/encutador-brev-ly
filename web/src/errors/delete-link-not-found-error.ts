export class DeleteLinkNotFoundError extends Error {
  constructor() {
    super('Link não encontrado')
    this.name = 'DeleteLinkNotFoundError'
  }
}
