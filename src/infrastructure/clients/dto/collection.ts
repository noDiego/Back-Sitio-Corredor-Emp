export interface TokenInfo {
  token: number;
  docName: string;
  docType: string;
}

export interface CollectionReport {
  policyNumber: number;
  tokenPayrollColletionExcel: TokenInfo;
  tokenPayrollColletionPDF: TokenInfo;
  tokenMovementsColletionExcel: TokenInfo;
  tokenMovementsColletionPDF: TokenInfo;
  tokenCollectionNotices: TokenInfo;
}

export interface CollectionResponse {
  collection: CollectionReport;
}

export interface BillingPDF {
  pdfFactura: string;
}
