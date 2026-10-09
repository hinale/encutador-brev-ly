export class InvalidExportRowError extends Error {
  constructor() {
    super('Unexpected link export row')
    this.name = 'InvalidExportRowError'
  }
}
