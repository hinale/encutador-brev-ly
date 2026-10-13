export class IncrementLinkAccessError extends Error {
  constructor() {
    super('Não foi possível registrar o acesso. Use o link manual.')
    this.name = 'IncrementLinkAccessError'
  }
}
