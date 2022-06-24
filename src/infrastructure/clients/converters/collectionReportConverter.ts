import { IReportDetail } from '../../../domain/interfaces/dto/v1/ICollectionReport';
import { CollectionReport, TokenInfo } from '../dto/collection';
import { COLLECTION_DOCUMENT_TYPE, FILE_TYPE } from '../../../constants/types';

export default (report?: CollectionReport): IReportDetail[] => {
  const details: IReportDetail[] = [];

  details.push(generateReportDetail(report.tokenCollectionNotices));
  details.push(generateReportDetail(report.tokenMovementsColletionExcel));
  details.push(generateReportDetail(report.tokenMovementsColletionPDF));
  details.push(generateReportDetail(report.tokenPayrollColletionExcel));
  details.push(generateReportDetail(report.tokenPayrollColletionPDF));

  return details;
};

function generateReportDetail(tokenInfo: TokenInfo): IReportDetail {
  return {
    docType: getCollectionType(tokenInfo.docType),
    fileType: getCollectionFileType(tokenInfo.docType),
    mount: undefined,
    name: tokenInfo.docName,
    token: tokenInfo.token
  };
}

function getCollectionType(typeString: string): COLLECTION_DOCUMENT_TYPE {
  switch (typeString) {
    case COLLECTION_DOCUMENT_TYPE.COB:
      return COLLECTION_DOCUMENT_TYPE.COB;
    case COLLECTION_DOCUMENT_TYPE.NOM:
      return COLLECTION_DOCUMENT_TYPE.NOM;
    case COLLECTION_DOCUMENT_TYPE.AJU:
      return COLLECTION_DOCUMENT_TYPE.AJU;
    case COLLECTION_DOCUMENT_TYPE.MOV:
      return COLLECTION_DOCUMENT_TYPE.MOV;
    case COLLECTION_DOCUMENT_TYPE.AVI:
      return COLLECTION_DOCUMENT_TYPE.AVI;
    default:
      return null;
  }
}
function getCollectionFileType(typeString: string): FILE_TYPE {
  switch (typeString) {
    case COLLECTION_DOCUMENT_TYPE.COB:
    case COLLECTION_DOCUMENT_TYPE.AJU:
      return FILE_TYPE.XLSX;
    case COLLECTION_DOCUMENT_TYPE.NOM:
    case COLLECTION_DOCUMENT_TYPE.AVI:
    case COLLECTION_DOCUMENT_TYPE.MOV:
      return FILE_TYPE.PDF;
    default:
      return null;
  }
}
