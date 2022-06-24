import { IResponseDTO } from '../../../utils/interfaces/IResponse';
import { IUserSSO } from '../dto/v3/IUserSSO';
import { IPolicyV1 } from '../dto/v1/IPolicy';
import { IContractor } from '../dto/v3/IContractor';

export interface IPolicyService {
  getPolicyFile(number: number, userSSO: IUserSSO): Promise<IPolicyV1>;

  getPlanDetail(renewalId: number, planCode: number, userSSO: IUserSSO): Promise<IResponseDTO>;

  getContractor(rutContractor: string, userSSO: IUserSSO): Promise<IContractor>;

  getContractors(
    page: number,
    limit: number,
    search: string,
    onlyBlocked,
    withRequirements,
    userSSO: IUserSSO
  ): Promise<IResponseDTO>;

  searchPolicies(parametro: string, page: number, limit: number, userSSO: IUserSSO): Promise<IResponseDTO>;

  validateContractorInsuredRut(insuredRut: string, contractorRut: string, userSSO: IUserSSO): Promise<IResponseDTO>;

  getInsuredList(
    search: string,
    policyNumber: number,
    page: number,
    limit: number,
    userSSO: IUserSSO
  ): Promise<IResponseDTO>;

  searchHealthPolicies(user: IUserSSO): Promise<IResponseDTO>;
}
