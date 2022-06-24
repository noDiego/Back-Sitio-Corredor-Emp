import { Profile } from '../entities/profile';
import { IProfileDTO } from '../../../domain/interfaces/dto/administration/IProfileDTO';
import { IFunctionalityDTO } from '../../../domain/interfaces/dto/administration/IFunctionalityDTO';
import functionalityEntityConverter from './functionalityEntityConverter';
import { Functionality } from '../entities/functionality';

export default (profileEntity: Profile): IProfileDTO => {
  const functionalitiesDTO: IFunctionalityDTO[] = [];
  profileEntity.functionalities.forEach((functionality: Functionality) => {
    functionalitiesDTO.push(functionalityEntityConverter(functionality));
  });
  return {
    description: profileEntity.description,
    functionalities: functionalitiesDTO,
    id: profileEntity.id,
    status: profileEntity.status
  };
};
