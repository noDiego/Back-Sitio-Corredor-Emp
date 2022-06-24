import { IDenounceDetail } from '../../../domain/interfaces/dto/v3/IDenounce';
import denounceConverter from './denounceConverter';
import { ClaimsDetail } from '../dto/claimsDetails';

export default (detail: ClaimsDetail): IDenounceDetail => {
  return {
    benefits: detail.benefits,
    deductibles: detail.deductiblesDetails,
    denounce: denounceConverter(detail.claims),
    paymentType: detail.paymentType
  };
};
