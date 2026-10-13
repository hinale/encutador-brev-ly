export class ExportLinksRequestError extends Error {
  constructor() {
    super('Não foi possível gerar o CSV. Tente novamente.')
    this.name = 'ExportLinksRequestError'
  }
}
