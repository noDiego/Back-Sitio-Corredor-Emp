import { IUserDTO } from '../dto/administration/IUserDTO';
import { IResponseDTO } from '../../../utils/interfaces/IResponse';
import { IProfileDTO } from '../dto/administration/IProfileDTO';
import { IFunctionalityDTO } from '../dto/administration/IFunctionalityDTO';

export interface IAdministrationRepository {
  insertUser(userInput: IUserDTO): Promise<IUserDTO>;

  deleteUser(rut: string): Promise<IResponseDTO>;

  updateUser(userInput: IUserDTO): Promise<IUserDTO>;

  getUserData(rut: string): Promise<IUserDTO>;

  insertProfile(profile: IProfileDTO): Promise<IProfileDTO>;

  getProfiles(): Promise<IProfileDTO[]>;

  updateProfile(profileInput: IProfileDTO): Promise<IProfileDTO>;

  deleteProfile(id: number): Promise<IResponseDTO>;

  insertFunctionality(input: IFunctionalityDTO): Promise<IFunctionalityDTO>;

  getFunctionalities(): Promise<IFunctionalityDTO[]>;

  updateFunctionality(functionality: IFunctionalityDTO): Promise<IFunctionalityDTO>;

  deleteFunctionality(code: string): Promise<IResponseDTO>;
}
