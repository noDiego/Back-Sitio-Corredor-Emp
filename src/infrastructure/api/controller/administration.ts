import { NextFunction, Request, Response } from 'express';
import AdministrationRepository from '../../database/administrationRepository';
import { Container } from 'typedi';
import { IFunctionalityDTO } from '../../../domain/interfaces/dto/administration/IFunctionalityDTO';
import { IUserDTO } from '../../../domain/interfaces/dto/administration/IUserDTO';
import { trackRequest } from '../../../loaders/insight';
import { IResponseDTO } from '../../../utils/interfaces/IResponse';
import { IProfileDTO } from '../../../domain/interfaces/dto/administration/IProfileDTO';

export default class AdministrationController {
  public async insertUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const databaseService: AdministrationRepository = Container.get(AdministrationRepository);
      const user: IUserDTO = await databaseService.insertUser(req.body);
      trackRequest(req, 200, user, true);
      return res.send(user).end();
    } catch (e) {
      next(e);
    }
  }

  public async getUserData(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const databaseService: AdministrationRepository = Container.get(AdministrationRepository);
      const user: IUserDTO = await databaseService.getUserData(String(req.query.rut));
      trackRequest(req, 200, user, true);
      return res.send(user);
    } catch (e) {
      next(e);
    }
  }

  public async deleteUser(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const databaseService: AdministrationRepository = Container.get(AdministrationRepository);
      const responseDTO: IResponseDTO = await databaseService.deleteUser(String(req.body.rut));
      trackRequest(req, 200, responseDTO, true);
      return res.send(responseDTO);
    } catch (e) {
      next(e);
    }
  }

  public async updateUser(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const databaseService: AdministrationRepository = Container.get(AdministrationRepository);
      const updatedUser: IUserDTO = await databaseService.updateUser(req.body);
      trackRequest(req, 200, updatedUser, true);
      return res.send(updatedUser);
    } catch (e) {
      next(e);
    }
  }

  public async insertProfile(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const profileService: AdministrationRepository = Container.get(AdministrationRepository);
      const profile: IProfileDTO = await profileService.insertProfile(req.body);
      return res.status(200).json(profile);
    } catch (e) {
      next(e);
    }
  }

  public async getProfiles(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const profileService: AdministrationRepository = Container.get(AdministrationRepository);
      const profiles: IProfileDTO[] = await profileService.getProfiles();
      trackRequest(req, 200, profiles, true);
      return res.status(200).json(profiles);
    } catch (e) {
      next(e);
    }
  }

  public async deleteProfile(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const profileService: AdministrationRepository = Container.get(AdministrationRepository);
      const response: IResponseDTO = await profileService.deleteProfile(req.body.id);
      trackRequest(req, 200, response, true);
      return res.status(200).json(response);
    } catch (e) {
      next(e);
    }
  }

  public async updateProfile(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const profileService: AdministrationRepository = Container.get(AdministrationRepository);
      const response: IProfileDTO = await profileService.updateProfile(req.body);
      trackRequest(req, 200, response, true);
      return res.status(200).json(response);
    } catch (e) {
      next(e);
    }
  }

  public async insertFunctionality(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const functionalityService: AdministrationRepository = Container.get(AdministrationRepository);
      const functionalityInput: IFunctionalityDTO = req.body as IFunctionalityDTO;
      const functionality: IFunctionalityDTO = await functionalityService.insertFunctionality(functionalityInput);
      trackRequest(req, 200, functionality, true);
      return res.status(200).json(functionality);
    } catch (e) {
      next(e);
    }
  }

  public async getFunctionalities(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const functionalityService: AdministrationRepository = Container.get(AdministrationRepository);
      const functionalities: IFunctionalityDTO[] = await functionalityService.getFunctionalities();
      trackRequest(req, 200, functionalities, true);
      return res.status(200).json(functionalities);
    } catch (e) {
      next(e);
    }
  }

  public async deleteFunctionality(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const functionalityService: AdministrationRepository = Container.get(AdministrationRepository);
      const response: IResponseDTO = await functionalityService.deleteFunctionality(req.body.planCode);
      trackRequest(req, 200, response, true);
      return res.status(200).json(response);
    } catch (e) {
      next(e);
    }
  }

  public async updateFunctionality(req: Request, res: Response, next: NextFunction): Promise<Response> {
    try {
      const functionalityService: AdministrationRepository = Container.get(AdministrationRepository);
      const functionalityInput: IFunctionalityDTO = req.body;
      const respUpdate: IFunctionalityDTO = await functionalityService.updateFunctionality(functionalityInput);
      trackRequest(req, 200, respUpdate, true);
      return res.status(200).json(respUpdate);
    } catch (e) {
      next(e);
    }
  }
}
