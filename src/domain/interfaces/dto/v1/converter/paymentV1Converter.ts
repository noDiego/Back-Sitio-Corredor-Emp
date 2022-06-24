import { IPaymentTypeDetail } from '../../v3/IPaymentDetail';
import { IPaymentV1 } from '../IPayment';

//Convierte VS Final de IPaymentTypeDetail (V3) a primera version IPaymentV1
export default (paymentDetail: IPaymentTypeDetail): IPaymentV1 => {
  return {
    accountNumber: paymentDetail.cuenta,
    costCenter: null,
    bank: paymentDetail.bank.name,
    deposit: null,
    paymentMethod: null,
    accountType: paymentDetail.bankTypeAccount.name,
    id: paymentDetail.codigo
  };
};
