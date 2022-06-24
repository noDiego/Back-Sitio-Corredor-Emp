import { Functionality } from '../entities/functionality';
import { IFunctionalityDTO } from '../../../domain/interfaces/dto/administration/IFunctionalityDTO';

export default (functionalityEntity: Functionality): IFunctionalityDTO => {
  return {
    code: functionalityEntity.code,
    description: functionalityEntity.description,
    status: functionalityEntity.status
  };
};
