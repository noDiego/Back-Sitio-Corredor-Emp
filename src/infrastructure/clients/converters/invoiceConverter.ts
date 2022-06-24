import { dateValidation } from '../../../utils/validators';
import { Invoice } from '../dto/invoice';
import { IInvoice } from '../../../domain/interfaces/dto/v3/ICollection';

export default (invoice: Invoice): IInvoice => {
  return {
    policy: +invoice.policyNumber,
    id: invoice.billId,
    invoiceNumber: invoice.invoice,
    invoiceType: invoice.billType,
    companyRut: null,
    company: null,
    favorOf: invoice.inFavorOf,
    debtStatus: invoice.debtStatus,
    gracePeriod: invoice.periodOfGrace,
    issuanceDate: invoice.collectionIssueDate,
    invoiceDate: dateValidation(invoice.invoiceDate),
    expirationDate: dateValidation(invoice.expirationDate),
    invoicedAmount: invoice.billedAmount,
    collectionGroupCode: invoice.collectionGroup.code,
    collectionGroupName: invoice.collectionGroup.nameGroup,
    invoiceCompanyRut: invoice.billRut,
    invoiceCompany: invoice.billRut,
    rutsubsidiary: undefined, //TODO Por implementar objeto collectionGroup mcadiz
    subsidiary: undefined, //TODO Por implementar objeto collectionGroup mcadiz
    period: invoice.coveragePeriod,
    fileId: null
  };
};
