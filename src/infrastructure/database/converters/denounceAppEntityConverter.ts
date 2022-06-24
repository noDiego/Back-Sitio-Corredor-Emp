import { DenounceApplication } from '../entities/denounceApplication';
import { IDenounceApplicationDTO } from '../../../domain/interfaces/dto/v1/IDenounceApplication';
import { DenounceFile } from '../entities/denounceFile';

export default (denounceApp: DenounceApplication): IDenounceApplicationDTO => {
  const fileNames: string[] = [];
  if (denounceApp.files) {
    denounceApp.files.forEach((file: DenounceFile) => {
      fileNames.push(file.name);
    });
  }

  return {
    id: denounceApp.id,
    amount: denounceApp.amount,
    applicationNumber: denounceApp.amount,
    beneficiaryName: denounceApp.beneficiaryName,
    beneficiaryRut: denounceApp.beneficiaryRut,
    comment: denounceApp.comment,
    consignment: denounceApp.consignment,
    creationDate: denounceApp.creationDate,
    denounceFiles: fileNames,
    denounceType: denounceApp.denounceType,
    denounceTypeCode: denounceApp.denounceTypeCode,
    insuredEmail: denounceApp.insuredEmail,
    insuredLastname: denounceApp.insuredLastname,
    insuredName: denounceApp.insuredName,
    insuredRut: denounceApp.insuredRut,
    plan: denounceApp.plan,
    planCode: denounceApp.planCode,
    policy: denounceApp.policy,
    renovation: denounceApp.renovation,
    status: denounceApp.status,
    userEmail: denounceApp.userEmail,
    userName: denounceApp.userName,
    userRut: denounceApp.userRut,
    groupCode: denounceApp.groupCode,
    paymentId: denounceApp.paymentId
  };
};
