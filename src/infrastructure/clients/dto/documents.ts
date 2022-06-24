export interface BackupDocument {
  IdDocumento: number;
  Url: string;
}

export interface BackupDocumentsResponse {
  httpCode: number;
  httpMessage: string;
  moreInformation: string;
  Documentos: BackupDocument[];
}
