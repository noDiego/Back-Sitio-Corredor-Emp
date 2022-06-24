import { CityResponse, City } from '../dto/common';
import { Ciudad } from '../../../domain/interfaces/dto/v3/ILocalidad';

export default (citiesResponse: CityResponse): Ciudad[] => {
  const citiesList: Ciudad[] = [];
  citiesResponse.cities.forEach((cities: City) => {
    citiesList.push({
      code: cities.cityCode,
      regCode: cities.regionCode,
      name: cities.cityName
    });
  });

  return citiesList;
};
