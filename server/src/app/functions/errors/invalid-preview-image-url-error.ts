export class InvalidPreviewImageUrlError extends Error {
  constructor() {
    super('Invalid preview image URL')
    this.name = 'InvalidPreviewImageUrlError'
  }
}
