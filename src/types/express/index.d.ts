import { IUserSSO } from '../../domain/interfaces/dto/v3/IUserSSO';
import { IMulterFile } from '../../domain/interfaces/dto/v3/IMulterFile';

declare global {
  namespace Express {
    interface Request {
      currentUser: IUserSSO;
      file: IMulterFile;
      startTime: number;
    }
  }
}
