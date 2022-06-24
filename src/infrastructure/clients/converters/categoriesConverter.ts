import { CategoryResponse, Category } from '../dto/common';
import { ICodeObject } from '../../../domain/interfaces/dto/v3/ICodeObject';

export default (categories?: CategoryResponse): ICodeObject[] => {
  const categoriesList: ICodeObject[] = [];
  categories.category.categoryElements.forEach((categoria: Category) => {
    categoriesList.push({
      code: categoria.code,
      name: categoria.description
    });
  });

  return categoriesList;
};
