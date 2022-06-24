import { IResponseDTO } from '../../../utils/interfaces/IResponse';
import { InsuredEdition } from '../dto/v3/IInsured';
import * as exceljs from 'exceljs';
import { IUserSSO } from '../dto/v3/IUserSSO';

export interface IInsuredService {
  searchInsured(parametro: string, page: number, limit: number, userSSO: IUserSSO): Promise<IResponseDTO>;

  getInsuredFile(rutAsegurado: string, policyNumber: string, userSSO: IUserSSO): Promise<IResponseDTO>;

  updateInfo(inputData: InsuredEdition, userSSO: IUserSSO): Promise<IResponseDTO>;

  getInsuredDeductible(
    contractorRut: string,
    insuredRut: string,
    policy: string,
    userSSO: IUserSSO
  ): Promise<IResponseDTO>;

  generateXLSNomina(policyNumber: number, userSSO: IUserSSO): Promise<exceljs.Buffer>;

  getInsurabilityRequirement(insuredRut: string, policyNumber: number, userSSO: IUserSSO): Promise<IResponseDTO>;

  getInsurabilityRequirements(
    contractorRut: string,
    page: number,
    limit: number,
    data: string,
    userSSO: IUserSSO
  ): Promise<IResponseDTO>;

  getPrescriptions(
    insuredRut: string,
    policyNumber: number,
    page: number,
    limit: number,
    userSSO: IUserSSO
  ): Promise<IResponseDTO>;
}
