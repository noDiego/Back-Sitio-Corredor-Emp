import { IPolicy } from '../dto/v3/IPolicy';
import { IPlan } from '../dto/v3/IPlan';
import { IPagedResponse } from '../dto/v1/IResponse';
import { IInsured } from '../dto/v3/IInsured';
import { IUserSSO } from '../dto/v3/IUserSSO';
import { ContactInfoUpdate } from '../../../infrastructure/clients/dto/insured';

export interface IPolicyAdapter {
  getPolicyDetail(policyNumber: number, userSSO: IUserSSO): Promise<IPolicy>;
  getPoliciesByCompany(
    companyRut: number,
    rutInsuranceCo: number,
    page: number,
    offset: number,
    userSSO: IUserSSO
  ): Promise<IPagedResponse<IPolicy>>;
  getPoliciesByBroker(
    brokerRut: number,
    rutInsuranceCo: number,
    page: number,
    offset: number,
    userSSO: IUserSSO
  ): Promise<IPagedResponse<IPolicy>>;
  getPoliciesByInsured(
    insuredRut: number,
    rutInsuranceCo: number,
    page: number,
    offset: number,
    userSSO: IUserSSO
  ): Promise<IPagedResponse<IPolicy>>;
  getPlanDetail(renewalId: number, planCode: number, userSSO: IUserSSO): Promise<IPlan>;
  getInsuredDetail(policyNumber: number, insuredRut: number, userSSO: IUserSSO): Promise<any>;
  getInsuredsByPolicy(
    policyNumber: number,
    page: number,
    offset: number,
    userSSO: IUserSSO
  ): Promise<IPagedResponse<IInsured>>;
  getInsuredCoverageByPolicy(
    policyNumber: number,
    rutInsuranceCo: number,
    planCode: number,
    userSSO: IUserSSO
  ): Promise<any>;
  updateInfoAsegurado(policyNumber: number, inputData: ContactInfoUpdate, userSSO: IUserSSO): Promise<boolean>;
  getReport(insuredRut: number, policyNumber: number, productCode: number, userSSO: IUserSSO): Promise<string>;
  exclusionInsured(insuredRut: number, insuredDV: string, policyNumber: number, endDate: Date, userSSO: IUserSSO);
}
