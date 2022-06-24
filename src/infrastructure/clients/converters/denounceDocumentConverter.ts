import { IDenounceFileRouteDTO } from '../../../domain/interfaces/dto/v1/IDenounce';
import { BackupDocument } from '../dto/documents';

export default (detail: BackupDocument): IDenounceFileRouteDTO => {
  return {
    id: detail.IdDocumento,
    name: 'string',
    route: detail.Url
  };
};
