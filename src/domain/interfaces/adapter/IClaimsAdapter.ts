import { IUserSSO } from '../dto/v3/IUserSSO';
import { IPrescription } from '../dto/v3/IPrescription';
import { InsuredDeductible } from '../dto/v3/IInsured';
import { IDenounce, IDenounceDetail, IDenounceServiceInput } from '../dto/v3/IDenounce';
import { IPagedResponse } from '../dto/v1/IResponse';
import { IPaymentTypeDetail } from '../dto/v3/IPaymentDetail';
import { HealthBeneficiary } from '../dto/v3/IHealthBeneficiary';
import { IDenounceFileRouteDTO } from '../dto/v1/IDenounce';

export interface IClaimsAdapter {
  getPrescriptions(insuredRut: number, policyNumber: number, user: IUserSSO): Promise<IPrescription[]>;

  getInsuredDeductible(insuredRut: number, policyNumber: number, user: IUserSSO): Promise<InsuredDeductible[]>;

  getDenouncesByPolicy(input: IDenounceServiceInput, user: IUserSSO): Promise<IPagedResponse<IDenounce>>;

  getDenouncesByCompanyAndInsured(input: IDenounceServiceInput, user: IUserSSO): Promise<IPagedResponse<IDenounce>>;

  getDenouncesByBrokerAndInsured(input: IDenounceServiceInput, user: IUserSSO): Promise<IPagedResponse<IDenounce>>;

  getDenouncesByRemittanceId(
    rutInsuranceCo: number,
    remittanceId: string,
    page: number,
    limit: number,
    user: IUserSSO
  ): Promise<IPagedResponse<IDenounce>>;

  getClaimDetail(requestNumber: number, insuranceCo: number, user: IUserSSO): Promise<IDenounceDetail>;

  getPaymentDetails(policyNumber: number, user: IUserSSO): Promise<IPaymentTypeDetail[]>;

  getHealthBeneficiaries(
    insuredRut: number,
    policyNumber: number,
    insuranceCo: number,
    companyRut: number,
    brokerRut: number,
    remittanceType: string,
    user: IUserSSO
  ): Promise<HealthBeneficiary[]>;

  getBackupDocs(nsolicitud: number, user: IUserSSO): Promise<IDenounceFileRouteDTO[]>;
}
