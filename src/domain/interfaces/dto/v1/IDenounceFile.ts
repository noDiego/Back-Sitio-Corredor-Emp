export interface IDenounceFileDTO {
  id?: number;
  blobName?: string;
  name: string;
  extension: string;
  mimeType: string;
  denounceApplicationID: number;
  creationDate?: Date;
  status?: string;
  retryCount?: number;
  buffer?: Buffer;
}
