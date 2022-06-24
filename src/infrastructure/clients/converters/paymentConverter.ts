import { dateValidation } from '../../../utils/validators';
import { IPaymentHistory } from '../../../domain/interfaces/dto/v3/ICollection';
import { Payment } from '../dto/payment';

export default (payment: Payment): IPaymentHistory => {
  return {
    contractRut: undefined, //TODO mcadiz
    noticeNumber: payment.notificationNumber,
    voucherNumber: payment.voucher,
    branchOffice: payment.channel,
    period: payment.coveragePeriod,
    subsidiary: '',
    subsidiaryRut: '',
    policy: payment.policyNumber,
    paymentDate: dateValidation(payment.paymentDate),
    amountPay: payment.amount,
    collectionGroupCode: payment.collectionGroup.code,
    collectionGroupName: payment.collectionGroup.nameGroup
  };
};
