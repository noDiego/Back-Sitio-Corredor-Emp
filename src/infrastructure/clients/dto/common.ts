export interface CategoryResponse {
  category: CategoryData;
}

export interface CategoryData {
  categoryCode: string;
  categoryName: string;
  categoryElements: Category[];
}

export interface Category {
  code: string;
  description: string;
}

export interface CityResponse {
  cities: City[];
}

export interface City {
  cityCode: string;
  cityName: string;
  regionCode: string;
}

export interface CommuneResponse {
  communes: Commune[];
}

export interface Commune {
  comuneCode: string;
  comuneName: string;
  cityCode: string;
}

export interface FileResponse {
  file: File;
}

export interface File {
  fileName: string;
  fileExtension: string;
  base64: string;
}
