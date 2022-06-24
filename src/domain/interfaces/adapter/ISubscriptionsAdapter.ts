import { IUserSSO } from '../dto/v3/IUserSSO';
import { IInsuranceReqInput, IInsuranceRequirement } from '../dto/v3/IInsuranceRequirement';
import { IPagedResponse } from '../dto/v1/IResponse';

export interface ISubscriptionsAdapter {
  getInsuranceRequirements(
    input: IInsuranceReqInput,
    page: number,
    limit: number,
    userSSO: IUserSSO
  ): Promise<IPagedResponse<IInsuranceRequirement>>;
}
