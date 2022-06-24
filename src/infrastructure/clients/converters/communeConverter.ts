import { CommuneResponse, Commune } from '../dto/common';
import { Comuna } from '../../../domain/interfaces/dto/v3/ILocalidad';

export default (communeResponse: CommuneResponse): Comuna[] => {
  const communesList: Comuna[] = [];
  communeResponse.communes.forEach((commune: Commune) => {
    communesList.push({
      code: commune.comuneCode,
      cityCode: commune.cityCode,
      name: commune.comuneName
    });
  });

  return communesList;
};
