import { PaymentTypeDetail } from '../dto/paymentType';
import { IPaymentTypeDetail } from '../../../domain/interfaces/dto/v3/IPaymentDetail';

export default (paymentDetail: PaymentTypeDetail): IPaymentTypeDetail => {
  return {
    bank: {
      code: String(paymentDetail.bank.code),
      name: paymentDetail.bank.name
    },
    bankTypeAccount: {
      code: String(paymentDetail.bankTypeAccount.code),
      name: paymentDetail.bankTypeAccount.name
    },
    codigo: paymentDetail.codigo,
    cuenta: paymentDetail.cuenta,
    destinatario: paymentDetail.destinatario
  };
};
