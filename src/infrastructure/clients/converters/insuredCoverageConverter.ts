import { ICoverage } from '../../../domain/interfaces/dto/v3/ICoverage';
import { PolicyCoverage, Product } from '../dto/product';
import { IPlan, IProduct } from '../../../domain/interfaces/dto/v3/IPlan';
import { Coverage } from '../dto/coverage';

export default (insuredCoverage: PolicyCoverage): IPlan => {
  const products: IProduct[] = [];
  insuredCoverage.products.forEach((product: Product) => {
    const coverages: ICoverage[] = [];

    product.coverages.forEach((coverage: Coverage) => {
      coverages.push({
        id: coverage.id,
        code: String(coverage.code),
        name: coverage.name,
        appliesBenefitPlan: coverage.appliesBenefitsPlan,
        tokenBenefits: coverage.tokenBenefits,
        capital: coverage.capital,
        limit: coverage.limit,
        premium: coverage.premium
      });
    });

    products.push({
      code: product.code,
      name: product.name,
      hasCertificate: product.hasCertificate == 'SI',
      coverages: coverages
    });
  });

  return {
    code: insuredCoverage.code,
    name: insuredCoverage.name,
    products: products
  };
};
