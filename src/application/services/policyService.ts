import rutjs from 'rut.js';
import { Inject, Service } from 'typedi';
import { IUserSSO } from '../../domain/interfaces/dto/v3/IUserSSO';
import { IResponseDTO } from '../../utils/interfaces/IResponse';
import { IInsuredV2 } from '../../domain/interfaces/dto/v2/IInsured';
import { IPolicyV2 } from '../../domain/interfaces/dto/v2/IPolicy';
import AdministrationRepository from '../../infrastructure/database/administrationRepository';
import { CONTRACTOR_STATUS } from '../../constants/status';
import { IValueObjectV1 } from '../../domain/interfaces/dto/v1/IValueObject';
import { IPolicyService } from '../../domain/interfaces/services/IPolicyService';
import { IPolicyV1 } from '../../domain/interfaces/dto/v1/IPolicy';
import PolicyApi from '../../infrastructure/clients/policyApi';
import policyV1Converter from '../../domain/interfaces/dto/v1/converter/policyV1Converter';
import { IPolicy } from '../../domain/interfaces/dto/v3/IPolicy';
import { IInsured } from '../../domain/interfaces/dto/v3/IInsured';
import insuredV2Converter from '../../domain/interfaces/dto/v2/converter/insuredV2Converter';
import { IPagedResponse } from '../../domain/interfaces/dto/v1/IResponse';
import Utils from '../../utils/utils';
import { IContractor, IContractorsResponse, IContractorsSummary } from '../../domain/interfaces/dto/v3/IContractor';
import policyV2Converter from '../../domain/interfaces/dto/v2/converter/policyV2Converter';
import { ClientType } from '../../constants/types';
import CustomerApi from '../../infrastructure/clients/customerApi';
import { IClient } from '../../domain/interfaces/dto/v3/IClient';
import config from '../../config';
import { IPlan } from '../../domain/interfaces/dto/v3/IPlan';
import { Logger } from '../../loaders/logger';
import { IInsuredGroup } from '../../domain/interfaces/dto/v3/IInsuredGroup';
import { ISubsidiary } from '../../domain/interfaces/dto/v3/ISubsidiary';
import { IUserDTO } from '../../domain/interfaces/dto/administration/IUserDTO';
import { IClientDTO } from '../../domain/interfaces/dto/administration/IClientDTO';
import { IError } from '../../utils/interfaces/IError';

@Service('PolicyService')
export default class PolicyService implements IPolicyService {
  @Inject('logger') private readonly logger: Logger;
  @Inject('PolicyApi') private readonly policyApi: PolicyApi;
  @Inject('AdministrationRepository') private readonly databaseService: AdministrationRepository;
  @Inject('CustomerApi') private readonly customerApi: CustomerApi;

  async getPolicyFile(policyNumber: number, userSSO: IUserSSO): Promise<IPolicyV1> {
    const policy: IPolicy = await this.policyApi.getPolicyDetail(policyNumber, userSSO);

    //Se le agregan datos faltantes con servicio customer
    const clientDetail: IClient = await this.customerApi.getClientDetails(
      Utils.getRutNumber(policy.contractor.rut),
      userSSO
    );

    if (clientDetail) {
      policy.contractor.address = clientDetail.address.adress;
      policy.contractor.bussinessLine = clientDetail.businessActivity;
    }

    return policyV1Converter(policy);
  }

  async getPlanDetail(renewalId: number, planCode: number, userSSO: IUserSSO): Promise<IResponseDTO> {
    const plan: IPlan = await this.policyApi.getPlanDetail(renewalId, planCode, userSSO);
    return {
      code: 0,
      message: 'OK',
      data: plan
    };
  }

  async getContractors(
    page: number,
    limit: number,
    search: string,
    onlyBlocked = false,
    withRequirements = false,
    userSSO: IUserSSO
  ): Promise<IResponseDTO> {
    const rutUser: string = userSSO.preferredUsername;
    // Se obtiene listado de contractors en base al rut de usuario y tipo de cliente
    this.logger.info('Obteniendo Contratantes para usuario ' + rutUser);
    let contractorList: IContractor[] = await this.getContractorsFromUser(userSSO);
    contractorList = contractorList.sort((a: IContractor, b: IContractor) => (a.name > b.name ? 1 : -1));

    if (!contractorList || contractorList.length < 1) {
      throw new Error('Rut asignado al usuario no posee polizas');
    }

    //Se genera resumen para cards de cartera
    const contractorsSummary: IContractorsSummary = {
      blockedAmount: contractorList.filter(
        (contractor: IContractor) => contractor.status == CONTRACTOR_STATUS.BLOQUEADO
      ).length,
      pendingReqAmount: contractorList.filter((contractor: IContractor) => contractor.hasPendingRequirements == true)
        .length,
      totalContractors: contractorList.length
    };

    //Se filtra la lista de contratantes con los parametros de busqueda
    if (search) {
      contractorList = contractorList.filter(
        (contractor: IContractor) =>
          contractor.name.toLowerCase().includes(search.toLowerCase()) ||
          rutjs.clean(contractor.rut).includes(search) ||
          rutjs.format(contractor.rut).includes(search) ||
          Utils.getRutNumber(contractor.rut) == Utils.getRutNumber(search) ||
          contractor.policiesList.find((p: IPolicyV2) => String(p.number).includes(search)) ||
          contractor.holding.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (onlyBlocked) {
      contractorList = contractorList.filter(
        (contractor: IContractor) => contractor.status == CONTRACTOR_STATUS.BLOQUEADO
      );
    } else if (withRequirements) {
      contractorList = contractorList.filter((contractor: IContractor) => contractor.hasPendingRequirements == true);
    }

    //Paginacion
    const startIndex: number = (page - 1) * limit;
    const endIndex: number = page * limit;
    const recordTotal: number = contractorList.length;
    const totalPage: number = Math.ceil(recordTotal / limit);
    const result: IContractor[] = contractorList.slice(startIndex, endIndex);
    //Fin Paginacion

    //Se generan datos de salida
    const contractorsResponse: IContractorsResponse = { contractors: result, summary: contractorsSummary };

    return {
      code: 0,
      message: 'OK',
      data: contractorsResponse,
      page: page,
      limit: limit,
      totalPage: totalPage,
      recordTotal: recordTotal
    };
  }

  async getContractor(rutContractor: string, userSSO: IUserSSO): Promise<IContractor> {
    //Se consulta contractor desde listado
    const contractorList: IContractor[] = await this.getContractorsFromUser(userSSO);

    //Se filtra el contractor por el rut enviado
    const contractorResult: IContractor = contractorList.find(
      (contractor: IContractor) => rutjs.format(contractor.rut) == rutjs.format(rutContractor)
    );

    //Se le agregan datos faltantes con servicio customer
    const clientDetail: IClient = await this.customerApi.getClientDetails(
      Utils.getRutNumber(contractorResult.rut),
      userSSO
    );
    if (clientDetail) {
      contractorResult.address = clientDetail.address.adress;
      contractorResult.bussinessLine = clientDetail.businessActivity;
    }
    return contractorResult;
  }

  async searchPolicies(parametro: string, page: number, limit: number, userSso: IUserSSO): Promise<IResponseDTO> {
    const userPolicies: IPolicy[] = await this.getUserPolicies(userSso);

    //Obtiene todos los datos de las polizas
    let policyConvertedList: IPolicyV1[] = [];
    userPolicies.forEach((policy: IPolicy) => {
      policyConvertedList.push(policyV1Converter(policy));
    });

    //Se filtra por numero de poliza o rut de company
    policyConvertedList = policyConvertedList.filter(
      (p: IPolicyV1) =>
        String(p.number) == parametro || Utils.getRutNumber(p.company.rut) == Utils.getRutNumber(parametro)
    );

    const startIndex: number = (page - 1) * limit;
    const endIndex: number = page * limit;
    const recordTotal: number = policyConvertedList.length;
    const totalPage: number = Math.ceil(recordTotal / limit);

    const result: IPolicyV1[] = policyConvertedList.slice(startIndex, endIndex);

    return {
      code: policyConvertedList.length > 0 ? 0 : 1,
      message: policyConvertedList.length > 0 ? 'OK' : 'NO DATA',
      data: result,
      page: page,
      limit: limit,
      totalPage: totalPage,
      recordTotal: recordTotal
    };
  }

  async searchHealthPolicies(user: IUserSSO): Promise<IResponseDTO> {
    const result: IValueObjectV1[] = [];
    try {
      this.logger.info('searchHealthPolicies - polizas de salud a buscar de usuario: ' + user.preferredUsername);
      const userPolicies: IPolicy[] = await this.getUserPolicies(user);
      userPolicies.forEach((pol: IPolicy) => {
        if (pol.hasHealthBenefits) {
          result.push({ code: String(pol.policyNumber), name: String(pol.policyNumber) });
        }
      });
      this.logger.info('searchHealthPolicies - total de polizas de salud encontradas: ' + result.length);
      return {
        code: 0,
        message: 'OK',
        data: result
      };
    } catch (e) {
      this.logger.error('searchHealthPolicies - error excepcion: ' + e.message);
      throw new Error('Error en el servicio de busqueda de poslizas de salud. Error: ' + e.message);
    }
  }

  async validateContractorInsuredRut(
    insuredRut: string,
    contractorRut: string,
    userSSO: IUserSSO
  ): Promise<IResponseDTO> {
    this.logger.info(
      'Validando ruts para ingreso individual de nomina: ' +
        JSON.stringify({ rutUser: userSSO.preferredUsername, insuredRut: insuredRut, contractorRut: contractorRut })
    );
    const insuredRutNumber: number = Utils.getRutNumber(insuredRut);
    let policiesList: IPolicy[] = [];
    const policiesListReturn: Array<any> = [];
    let userPoliciesList: IPolicy[] = [];
    let pageService = 1;
    let totalPages: number;
    try {
      do {
        //traer lista de polizas del asegurado
        const insuredPolicies: IPagedResponse<IPolicy> = await this.policyApi.getPoliciesByInsured(
          insuredRutNumber,
          Utils.getRutNumber(Utils.RUTINSURANCECO),
          1,
          config.VSQueryLimit,
          userSSO
        );
        policiesList = policiesList.concat(insuredPolicies.data);
        totalPages = insuredPolicies.totalPage;
        pageService++;
      } while (pageService <= totalPages);

      if (policiesList && policiesList.length > 0) {
        const policyUserList: number[] = await this.getUserPoliciesList(userSSO);
        for (const policyNumber of policyUserList) {
          const policyData: IPolicy = policiesList.find(
            (p: IPolicy) => p.policyNumber == policyNumber && p.hasHealthBenefits
          );
          if (policyData) userPoliciesList.push(policyData);
        }
        if (userPoliciesList && userPoliciesList.length > 0) {
          userPoliciesList = userPoliciesList.filter(
            (policy: IPolicy) => rutjs.format(policy.company.rut) == rutjs.format(contractorRut)
          );
          if (!userPoliciesList || userPoliciesList.length < 1) {
            return {
              code: 3,
              message: 'Rut de Asegurado no corresponde a Contractor'
            };
          }
        } else {
          return {
            code: 3,
            message: 'Rut de Asegurado no pertenece a la cartera del usuario'
          };
        }
      } else {
        return {
          code: 3,
          message: 'Rut de Asegurado sin información'
        };
      }

      let insuredData: IInsured;

      for (const policy of userPoliciesList) {
        const planList: Array<any> = [];
        const subsidiaryList: Array<any> = [];
        const policyData: IPolicy = await this.policyApi.getPolicyDetail(policy.policyNumber, userSSO);
        insuredData = await this.policyApi.getInsuredDetail(policy.policyNumber, insuredRutNumber, userSSO);

        //Asegurado no vigente para poliza
        const today: Date = new Date();
        if (insuredData.endDate <= today) {
          break;
        }

        policyData.insuredGroup.forEach((group: IInsuredGroup) => {
          const groupPlan: IPlan = policyData.plans.find((plan: IPlan) => plan.code == group.planCode);
          if (groupPlan) {
            //Valido que la lista de plan sea distinta a la actual
            if (insuredData.plan.code != group.planCode) {
              planList.push({ plan: groupPlan, codeGroup: group.code, idGroup: group.idGroup });
            }
          }

          const groupSubsidiary: ISubsidiary = policyData.subsidiaries.find(
            (subsidiary: ISubsidiary) => subsidiary.code == group.subsidiaryCode
          );
          if (groupSubsidiary) {
            //Valido que la lista de filiales de destino pertenenezcan al plan de origen
            if (insuredData.plan.code == group.planCode && insuredData.subsidiary.code != group.subsidiaryCode) {
              subsidiaryList.push({ subsidiary: groupSubsidiary, codeGroup: group.code, idGroup: group.idGroup });
            }
          }
        });

        //Se agregan polizas al listado de salida
        policiesListReturn.push({
          policyNumber: policy.policyNumber,
          rent: insuredData.rent,
          capital: insuredData.capital,
          origen: { subsidiary: insuredData.subsidiary, plan: insuredData.plan },
          destiny: { subsidiaries: subsidiaryList, plans: planList }
        });
      }

      if (!policiesListReturn || policiesListReturn.length < 1) {
        return {
          code: 3,
          message: 'Rut de Asegurado no se encuentra vigente en ninguna poliza'
        };
      }

      const data: any = {
        insuredDetail: insuredData,
        policies: policiesListReturn
      };

      this.logger.info('Validacion de ruts OK');

      return {
        code: 0,
        data: data,
        message: 'OK'
      };
    } catch (e) {
      this.logger.error('validateContractorInsuredRut - error excepcion: ' + e.message);
      throw new Error(
        'Error en el servicio de validacion de datos de insured rut para contractor. Error: ' + e.message
      );
    }
  }

  async getInsuredList(
    rutInsured: string,
    policyNumber: number,
    page: number,
    limit: number,
    userSSO: IUserSSO
  ): Promise<IPagedResponse<IInsuredV2>> {
    let insuredResponse: IPagedResponse<IInsured>;
    let insuredV2List: IInsuredV2[] = [];

    if (!rutInsured) {
      insuredResponse = await this.policyApi.getInsuredsByPolicy(policyNumber, page, limit, userSSO);

      insuredResponse.data.forEach((insuredV3: IInsured) => {
        insuredV2List.push(insuredV2Converter(insuredV3));
      });
    } else {
      //Caso en que se busca asegurado especifico
      const insuredFound: IInsured = await this.policyApi.getInsuredDetail(
        policyNumber,
        Utils.getRutNumber(rutInsured),
        userSSO
      );
      insuredV2List = insuredFound ? [insuredV2Converter(insuredFound)] : [];
    }

    return {
      code: insuredV2List.length > 0 ? 0 : 1,
      message: insuredV2List.length > 0 ? 'OK' : 'SIN DATOS',
      data: insuredV2List,
      page: page,
      limit: limit,
      totalPage: insuredResponse ? insuredResponse.totalPage : 1,
      recordTotal: insuredResponse ? insuredResponse.recordTotal : insuredV2List.length
    };
  }

  private async getContractorsFromUser(userSSO: IUserSSO): Promise<IContractor[]> {
    //Servicio para obtener contractors desde companys de Policys

    const rutUser: string = userSSO.preferredUsername;

    this.logger.info(`Obteniendo Contractors para rut: ${rutUser}`);

    //Obtiene todos los datos de las polizas
    const policiesList: IPolicy[] = await this.getUserPolicies(userSSO);

    //Se refactorizan para crear lista de contratantes
    const contractorList: IContractor[] = [];
    policiesList.forEach((policy: IPolicy) => {
      const policyV2: IPolicyV2 = policyV2Converter(policy);

      //Se busca policy.company.rut en listado de contratantes que se esta generando
      let contractor: IContractor = contractorList.find(
        (predContractor: IContractor) => rutjs.format(predContractor.rut) == rutjs.format(policyV2.company.rut)
      );
      if (!contractor) {
        //Si no existe contractor en el arreglo, se crea uno con los datos de company y se agrega al listado
        contractor = {
          rut: policyV2.company.rut,
          name: policyV2.company.name,
          holding: policyV2.holding,
          status: CONTRACTOR_STATUS.VIGENTE,
          hasPendingRequirements: false,
          policiesList: []
        };
        contractorList.push(contractor);
      }

      //Se setea contractor como bloqueado si al menos una poliza esta bloqueada
      if (policyV2.isBlocked) contractor.status = CONTRACTOR_STATUS.BLOQUEADO;

      //Se setea contractor con requisitos de asegurado si al menos una poliza tiene requisitos
      if (policyV2.hasPendingRequirements) contractor.hasPendingRequirements = true;

      // Se agrega la poliza recorrida al listado contractor generado.
      contractor.policiesList.push(policyV2);
    });
    return contractorList;
  }

  public async getUserPoliciesList(userSSO: IUserSSO): Promise<number[]> {
    const policyList: number[] = [];
    const policiesList: IPolicy[] = await this.getUserPolicies(userSSO);

    policiesList.forEach((policy: IPolicy) => {
      policyList.push(policy.policyNumber);
    });

    return policyList;
  }

  private async getUserPolicies(userSSO: IUserSSO): Promise<IPolicy[]> {
    const rutUser: string = userSSO.preferredUsername;
    const rutInsoranceCO: string = config.rutInsuranceCo;

    const userData: IUserDTO = await this.databaseService.getUserData(rutUser);
    const client: IClientDTO = userData.clients[0];

    //Se obtienen las polizas de
    let policiesList: IPolicy[] = [];
    let page = 1;
    let totalPages: number;

    do {
      let policiesResponse: IPagedResponse<IPolicy>;
      if (client.type == ClientType.BROKER) {
        policiesResponse = await this.policyApi.getPoliciesByBroker(
          Utils.getRutNumber(client.rut),
          Utils.getRutNumber(rutInsoranceCO),
          page,
          config.VSQueryLimit,
          userSSO
        );
      } else {
        policiesResponse = await this.policyApi.getPoliciesByCompany(
          Utils.getRutNumber(client.rut),
          Utils.getRutNumber(rutInsoranceCO),
          page,
          config.VSQueryLimit,
          userSSO
        );
      }
      policiesList = policiesList.concat(policiesResponse.data);
      totalPages = policiesResponse.totalPage;
      page++;
    } while (page <= totalPages);
    return policiesList;
  }

  async validatePolicePermission(policyNumber: number, user: IUserSSO): Promise<void> {
    const policyUserList: number[] = await this.getUserPoliciesList(user);
    const result: number = policyUserList.find((policy: number) => policy == policyNumber);
    if (!result) throw new IError(`Poliza ${policyNumber} no pertenece a Usuario`, 'UnauthorizedError', 401);
  }
}
