export class AddAttachmentEvent {
  constructor(public resourceId: string, public fileName: string) {}
  toString() {
    return JSON.stringify({
      resourceId: this.resourceId,
      fileName: this.fileName,
    });
  }
}
