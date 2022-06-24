import { IPrescription } from '../../../domain/interfaces/dto/v3/IPrescription';
import { Prescription } from '../dto/prescriptions';
import { PRESCRIPTION_STATUS as PrescriptionStatus } from '../../../constants/status';
import moment from 'moment';

export default (prescription?: Prescription): IPrescription => {
  return {
    beneficiary: prescription.beneficiary,
    comment: prescription.comments,
    endDate: prescription.endValidityDate,
    issueDate: prescription.issueDate,
    requestNumber: prescription.requestNumber,
    status: moment().isAfter(prescription.endValidityDate) ? PrescriptionStatus.CADUCADA : PrescriptionStatus.VIGENTE,
    name: prescription.name
  };
};
