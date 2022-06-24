import { Intermediary } from '../../../domain/interfaces/dto/v3/ICommission';
import { IntermediaryRes } from '../dto/commission';

export default (intermediaryRes: IntermediaryRes): Intermediary[] => {
  const intermediaryList: Intermediary[] = [];
  intermediaryRes.intermediaries.forEach((intermediary: Intermediary) => {
    intermediaryList.push({
      code: intermediary.code,
      name: intermediary.name,
      type: intermediary.type
    });
  });

  return intermediaryList;
};
