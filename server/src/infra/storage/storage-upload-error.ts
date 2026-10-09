export class StorageUploadError extends Error {
  constructor() {
    super('Storage upload failed')
    this.name = 'StorageUploadError'
  }
}
