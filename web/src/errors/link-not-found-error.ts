export class LinkNotFoundError extends Error {
  constructor() {
    super('Link não encontrado')
    this.name = 'LinkNotFoundError'
  }
}
