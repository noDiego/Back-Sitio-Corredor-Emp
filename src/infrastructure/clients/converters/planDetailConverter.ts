import { Plan, Product } from '../dto/plan';
import { IPlan, IProduct } from '../../../domain/interfaces/dto/v3/IPlan';

export default (plan?: Plan): IPlan => {
  const productList: IProduct[] = [];
  plan.products.forEach((product: Product) => {
    productList.push({
      code: product.code,
      coverages: product.coverages,
      name: product.name
    });
  });

  return {
    code: plan.code,
    name: plan.name,
    products: productList,
    requiresCapital: plan.requiresRent != 'NO',
    requiresRent: plan.requiresRent != 'NO',
    startDate: new Date(), //Dummy
    endDate: new Date() //Dummy
  };
};
