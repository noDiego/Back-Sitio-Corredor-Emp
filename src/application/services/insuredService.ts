import * as EmailValidator from 'email-validator';
import * as exceljs from 'exceljs';
import { Workbook, Worksheet } from 'exceljs';
import moment from 'moment';
import * as rutjs from 'rut.js';
import { Inject, Service } from 'typedi';
import { IInsuredDTO, InsuredDeductibleDataDTO, InsuredDeductibleDTO } from '../../domain/interfaces/dto/v1/IInsured';
import { IInsuredPolicyV1 } from '../../domain/interfaces/dto/v1/IInsuredPolicy';
import { IResponseDTO } from '../../utils/interfaces/IResponse';
import { IPrescription } from '../../domain/interfaces/dto/v3/IPrescription';
import { IInsuranceReqInput, IInsuranceRequirement } from '../../domain/interfaces/dto/v3/IInsuranceRequirement';
import { IInsuredService } from '../../domain/interfaces/services/IInsuredService';
import { IDependent, IInsured, InsuredEdition, IPolicyAccess } from '../../domain/interfaces/dto/v3/IInsured';
import PolicyApi from '../../infrastructure/clients/policyApi';
import { IPlan, IProduct } from '../../domain/interfaces/dto/v3/IPlan';
import { IPolicy } from '../../domain/interfaces/dto/v3/IPolicy';
import { IPagedResponse } from '../../domain/interfaces/dto/v1/IResponse';
import Utils from '../../utils/utils';
import insuredFileV1Converter from '../../domain/interfaces/dto/v1/converter/insuredFileV1Converter';
import { IUserSSO } from '../../domain/interfaces/dto/v3/IUserSSO';
import insuredSearchV1Converter from '../../domain/interfaces/dto/v1/converter/insuredSearchV1Converter';
import PolicyService from './policyService';
import { returnEmpty } from '../../utils/apiutils';
import SubscriptionsApi from '../../infrastructure/clients/subscriptionsApi';
import { IError } from '../../utils/interfaces/IError';
import { ContactInfoUpdate } from '../../infrastructure/clients/dto/insured';
import ClaimsApi from '../../infrastructure/clients/claimsApi';
import { Logger } from '../../loaders/logger';
import { ICoverage } from '../../domain/interfaces/dto/v3/ICoverage';
import config from '../../config';

@Service('InsuredService')
export default class InsuredService implements IInsuredService {
  @Inject('logger') private readonly logger: Logger;
  @Inject('SubscriptionsApi') private readonly subscriptionsApi: SubscriptionsApi;
  @Inject('PolicyApi') private readonly policyApi: PolicyApi;
  @Inject('ClaimsApi') private readonly claimsApi: ClaimsApi;
  @Inject('PolicyService') private readonly policyService: PolicyService;

  async searchInsured(parametro: string, page: number, limit: number, user: IUserSSO): Promise<IResponseDTO> {
    let listaAsegurados: IInsuredPolicyV1[] = [];

    let policiesResponse: IPagedResponse<IPolicy>;
    let policiesList: IPolicy[] = [];
    const userPoliciesList: IPolicy[] = [];
    let pageService = 1;
    let totalPages: number;

    const insuredRut: number = Utils.getRutNumber(parametro);
    if (!insuredRut) return returnEmpty(page, limit);

    do {
      policiesResponse = await this.policyApi.getPoliciesByInsured(
        insuredRut,
        Utils.getRutNumber(Utils.RUTINSURANCECO),
        pageService,
        config.VSQueryLimit,
        user
      );
      policiesList = policiesList.concat(policiesResponse.data);
      totalPages = policiesResponse.totalPage;
      pageService++;
    } while (pageService <= totalPages);

    if (policiesList.length == 0) return returnEmpty(page, limit);

    const policyUserList: number[] = await this.policyService.getUserPoliciesList(user);

    for (const policyNumber of policyUserList) {
      const policyData: IPolicy = policiesList.find((p: IPolicy) => p.policyNumber == policyNumber);
      if (policyData) userPoliciesList.push(policyData);
    }

    if (userPoliciesList.length == 0) return returnEmpty(page, limit);

    const insuredData: IInsured = await this.policyApi.getInsuredDetail(
      userPoliciesList[0].policyNumber,
      insuredRut,
      user
    );

    if (!insuredData) return returnEmpty(page, limit);

    insuredData.policies = userPoliciesList;

    listaAsegurados = insuredSearchV1Converter(insuredData);

    const startIndex: number = (page - 1) * limit;
    const endIndex: number = page * limit;
    const recordTotal: number = listaAsegurados.length;
    const totalPage: number = Math.ceil(recordTotal / limit);

    const result: IInsuredPolicyV1[] = listaAsegurados.slice(startIndex, endIndex);

    return {
      code: 0,
      message: 'OK',
      data: result,
      page: page,
      limit: limit,
      totalPage: totalPage,
      recordTotal: recordTotal
    };
  }

  async getInsuredFile(rutAsegurado: string, policyNumber: string, userSSO: IUserSSO): Promise<IResponseDTO> {
    try {
      const insuredRut: number = Utils.getRutNumber(rutAsegurado);

      //Validacion que poliza pertenezca al usuario
      const policyUserList: number[] = await this.policyService.getUserPoliciesList(userSSO);

      const policyData: number = policyUserList.find((p: number) => p == Number(policyNumber));

      if (!policyData) {
        return {
          code: 1,
          message: 'Asegurado no existe, o no es de la cartera del usuario',
          data: null
        };
      }

      //traer informacion del asegurado
      const insured: IInsured = await this.policyApi.getInsuredDetail(Number(policyNumber), insuredRut, userSSO);

      //traer informacion de las coberturas
      const insuredCoverage: IPlan = await this.policyApi.getInsuredCoverageByPolicy(
        Number(insured.renewalId),
        insured.code,
        insured.plan.code,
        userSSO
      );

      //traer lista de polizas del asegurado
      const insuredPolicies: IPagedResponse<IPolicy> = await this.policyApi.getPoliciesByInsured(
        insuredRut,
        Utils.getRutNumber(Utils.RUTINSURANCECO),
        1,
        config.VSQueryLimit,
        userSSO
      );

      const policiesNumberList: IPolicyAccess[] = [];
      insuredPolicies.data.forEach((policy: IPolicy) => {
        if (policyNumber != String(policy.policyNumber)) {
          policiesNumberList.push({
            policyNumber: policy.policyNumber,
            hasAccess: policyUserList.findIndex((p: number) => p == policy.policyNumber) > 0
          });
        } else {
          insured.policies = [];
          insured.policies.push(policy);
        }
      });
      insured.products = insuredCoverage ? insuredCoverage.products : [];
      insured.policiesNumberList = policiesNumberList;

      const insuredConverted: IInsuredDTO = insuredFileV1Converter(insured);

      return {
        code: 0,
        message: 'OK',
        data: insuredConverted
      };
    } catch (e) {
      this.logger.error('Excepcion al obtener informacion de ficha asegurado, error:' + e.message);
      throw e;
    }
  }

  async updateInfo(inputData: InsuredEdition, userSSO: IUserSSO): Promise<IResponseDTO> {
    const errors: Array<any> = [];
    let result = false;
    try {
      if (isNaN(Number(inputData.accountNumber))) {
        errors.push({
          campo: 'accountNumber',
          error: 'Not number'
        });
      } else if (inputData.accountNumber.length > 10) {
        errors.push({
          campo: 'accountNumber',
          error: 'Maximum accountNumber length exceeded'
        });
      }

      // if (!/9[0-9]{8}$/.test(inputData.cellPhone)) { //TODO: SIN VALIDACIONES
      //   errors.push({
      //     campo: 'cellPhone',
      //     error: 'cellPhone invalid',
      //   });
      // }
      //if (inputData.email && !EmailValidator.validate(inputData.email)) {
      if (!EmailValidator.validate(inputData.email)) {
        errors.push({
          campo: 'email',
          error: 'Invalid Email'
        });
      }

      if (errors.length > 0) {
        return {
          code: 99,
          message: 'Validation Error',
          data: errors
        };
      }
      const insuredRut: number = Utils.getRutNumber(inputData.rut);
      const upateInfo: ContactInfoUpdate = {
        rut: insuredRut,
        dv: Utils.getRutDV(inputData.rut),
        bankCode: Number(inputData.codeBank),
        bankType: Number(inputData.codeAccountType), //revisar Carlos
        accountNumber: inputData.accountNumber,
        address: inputData.address,
        commune: Number(inputData.codeComuna),
        emailAddress: inputData.email,
        phoneNumber: inputData.phone,
        cellPhone: inputData.cellphone,
        isapre: inputData.codePrevision,
        user: userSSO.preferredUsername
      };

      if (inputData.allPolicies == 'true') {
        let policiesResponse: IPagedResponse<IPolicy>;
        let policiesList: IPolicy[] = [];
        let pageService = 1;
        let totalPages: number;
        do {
          policiesResponse = await this.policyApi.getPoliciesByInsured(
            insuredRut,
            Utils.getRutNumber(Utils.RUTINSURANCECO),
            pageService,
            config.VSQueryLimit,
            userSSO
          );
          policiesList = policiesList.concat(policiesResponse.data);
          totalPages = policiesResponse.totalPage;
          pageService++;
        } while (pageService <= totalPages);

        if (policiesList.length < 1)
          throw new IError('Error al buscar polizas asociadas al asegurado', 'UpdateInfoAsegurado', 1);

        for (const policy of policiesList) {
          result = await this.policyApi.updateInfoAsegurado(policy.policyNumber, upateInfo, userSSO);
        }
      } else {
        result = await this.policyApi.updateInfoAsegurado(Number(inputData.policyNumber), upateInfo, userSSO);
      }

      return {
        code: result ? 0 : 1,
        message: result ? 'OK' : 'Se ha producido un error en el servicio de actualizacion de asegurado',
        data: inputData
      };
    } catch (e) {
      this.logger.error('Excepcion servicio de actualizacion de datos de asegurado, error:' + e.message);
      throw e;
    }
  }

  async getInsuredDeductible(
    contractorRut: string,
    insuredRut: string,
    policy: string,
    userSSO: IUserSSO
  ): Promise<IResponseDTO> {
    try {
      this.logger.info(
        'Llamando a servicio de obtencion de deducible de asegurado, contractorRut: ' +
          contractorRut +
          ' ,insuredRut: ' +
          insuredRut +
          ' ,policy: ' +
          policy
      );
      const insuredRutNumber: number = Utils.getRutNumber(insuredRut);
      const deductibleInsured: InsuredDeductibleDTO[] = await this.claimsApi.getInsuredDeductible(
        insuredRutNumber,
        Number(policy),
        userSSO
      );

      if (!deductibleInsured || deductibleInsured.length < 1) {
        return returnEmpty();
      }

      const deductibleResponse: InsuredDeductibleDataDTO = {
        deductibles: deductibleInsured,
        totalDental: deductibleInsured.reduce(function (accumulator: number, deductible: InsuredDeductibleDTO) {
          return accumulator + deductible.dentalAmount;
        }, 0),
        totalHealth: deductibleInsured.reduce(function (accumulator: number, deductible: InsuredDeductibleDTO) {
          return accumulator + deductible.healthAmount;
        }, 0)
      };

      this.logger.info(
        'Finalizacion llamada servicio de obtencion de deducible de asegurado, cantidad de deducibles: ' +
          deductibleInsured.length
      );
      return {
        code: 0,
        message: 'OK',
        data: deductibleResponse
      };
    } catch (e) {
      this.logger.error('Excepcion servicio de obtencion de deducible de asegurado, error:' + e.message);
      throw e;
    }
  }

  async generateXLSNomina(policyNumber: number, user: IUserSSO): Promise<exceljs.Buffer> {
    //TODO: REWORK PENDIENTE POR SERVICIO

    const workbook: Workbook = new exceljs.Workbook();

    let totalPages: number;
    let pageService = 1;
    let insuredList: IInsured[] = [];
    do {
      const insuredsPolicyResponse: IPagedResponse<IInsured> = await this.policyApi.getInsuredsByPolicy(
        Number(policyNumber),
        pageService,
        config.VSQueryLimit,
        user
      );
      insuredList = insuredList.concat(insuredsPolicyResponse.data);
      totalPages = insuredsPolicyResponse.totalPage;
      pageService++;
    } while (pageService <= totalPages);
    workbook.creator = 'VidaSecurity';
    workbook.modified = new Date();

    const sheet: Worksheet = workbook.addWorksheet('Asegurados');
    sheet.columns = [
      { header: 'POLIZA', width: 10 },
      { header: 'TITULAR RUT', width: 16 },
      { header: 'RUT ASEGURADO', width: 16 },
      { header: 'NOMBRE', width: 23 },
      { header: 'APELLIDO', width: 23 },
      { header: 'FECHA NACIMIENTO', width: 19 },
      { header: 'PARENTESCO', width: 13 },
      { header: 'FILIAL', width: 32 },
      { header: 'GRUPO', width: 32 },
      { header: 'PLAN', width: 32 },
      { header: 'INICIO VIGENCIA', width: 16 },
      { header: 'TERMINO VIGENCIA', width: 16 },
      { header: 'PRODUCTO', width: 12 },
      { header: 'COBERTURA', width: 20 },
      { header: 'CAPITAL ASEGURADO', width: 20 },
      { header: 'TOPE', width: 10 }
    ];

    const rowNumber = 2;

    for (const insuredShort of insuredList) {
      await this.addNominaRow(sheet, rowNumber, insuredShort, user);
    }

    return await workbook.xlsx.writeBuffer();
  }

  private async addNominaRow(sheet: Worksheet, rowNumber: number, insured: IInsured, user: IUserSSO): Promise<void> {
    const insuredDetail: IInsured = await this.policyApi.getInsuredDetail(
      insured.policyNumber,
      Utils.getRutNumber(insured.rut),
      user
    );

    const planCoverage: IPlan = await this.policyApi.getInsuredCoverageByPolicy(
      insuredDetail.renewalId,
      insuredDetail.code,
      insuredDetail.plan.code,
      user
    );

    planCoverage.products.forEach((product: IProduct) => {
      product.coverages.forEach((planCoverage: ICoverage) => {
        sheet.insertRow(rowNumber++, [
          insured.policyNumber,
          rutjs.format(insured.rut),
          rutjs.format(insured.rut),
          insured.firstName,
          insured.lastName,
          moment(insured.birthDate).format('L'),
          'TITULAR',
          insured.subsidiary.rut,
          insured.insuredGroup.name,
          insured.plan.name,
          moment(insured.startDate).format('L'),
          moment(insured.endDate).format('L'),
          product.name,
          planCoverage.name,
          planCoverage.capital,
          planCoverage.limit
        ]);
      });
    });

    if (insuredDetail.familyGroup)
      insuredDetail.familyGroup.dependent.forEach((dependent: IDependent) => {
        sheet.insertRow(rowNumber++, [
          insured.policyNumber,
          rutjs.format(insured.rut),
          dependent.rut,
          dependent.firstName,
          dependent.lastName,
          moment(insured.birthDate).format('L'),
          dependent.relationship.name,
          '',
          '',
          '',
          moment(dependent.startDate).format('L'),
          moment(dependent.endDate).format('L'),
          '',
          '',
          '',
          ''
        ]);
      });
  }

  async getInsurabilityRequirement(insuredRut: string, policyNumber: number, userSSO: IUserSSO): Promise<IResponseDTO> {
    this.logger.info('Se consulta el requisito de asegurabilidad para rut insured:' + insuredRut);

    const inputReq: IInsuranceReqInput = {
      rutInsurCo: Utils.getRutNumber(Utils.RUTINSURANCECO),
      insuredRut: Utils.getRutNumber(insuredRut),
      policyNum: policyNumber
    };
    const response: IResponseDTO = await this.subscriptionsApi.getInsuranceRequirements(inputReq, 1, 100, userSSO);

    return {
      code: response.data.length > 0 ? 0 : 1,
      message: response.data.length > 0 ? 'OK' : 'SIN DATOS',
      data: response.data.length > 0 ? response.data[0] : null
    };
  }

  async getInsurabilityRequirements(
    contractorRut: string,
    page: number,
    limit: number,
    data: string,
    userSSO: IUserSSO
  ): Promise<IResponseDTO> {
    this.logger.info('Se consultan los requisitos de asegurabilidad para rut contractor:' + contractorRut);
    // const requirements: IInsuranceRequirement[] = this.insuredClient.getInsuredRequirements(contractorRut);
    let requirements: IInsuranceRequirement[] = [];
    let pagedResponse: IPagedResponse<IInsuranceRequirement>;

    const inputReq: IInsuranceReqInput = {
      rutInsurCo: Utils.getRutNumber(Utils.RUTINSURANCECO),
      rutCo: Utils.getRutNumber(contractorRut)
    };

    if (data) {
      let pageService = 1;
      let totalPages: number;
      do {
        const pagedResponse: IPagedResponse<IInsuranceRequirement> = await this.subscriptionsApi.getInsuranceRequirements(
          inputReq,
          page,
          config.VSQueryLimit,
          userSSO
        );
        requirements = requirements.concat(pagedResponse.data);
        totalPages = pagedResponse.totalPage;
        pageService++;
      } while (pageService <= totalPages);
      requirements = requirements.filter(
        (requirement: IInsuranceRequirement) => Utils.getRutNumber(requirement.insured.rut) == Utils.getRutNumber(data)
      );
    } else {
      pagedResponse = await this.subscriptionsApi.getInsuranceRequirements(inputReq, page, limit, userSSO);
      requirements = pagedResponse.data;
    }

    return {
      code: 0,
      message: requirements.length > 0 ? 'OK' : 'SIN DATOS',
      data: requirements,
      page: page,
      limit: limit,
      totalPage: data ? Math.ceil(requirements.length / limit) : pagedResponse.totalPage,
      recordTotal: data ? requirements.length : pagedResponse.recordTotal
    };
  }

  async getPrescriptions(
    insuredRut: string,
    policyNumber: number,
    page: number,
    limit: number,
    userSSO: IUserSSO
  ): Promise<IResponseDTO> {
    const insuredRutNumber: number = Utils.getRutNumber(insuredRut);
    this.logger.info('Se consultan las recetas para rut:' + insuredRutNumber);

    const prescriptions: IPrescription[] = await this.claimsApi.getPrescriptions(
      insuredRutNumber,
      policyNumber,
      userSSO
    );

    //Paginacion
    const startIndex: number = (page - 1) * limit;
    const endIndex: number = page * limit;
    const recordTotal: number = prescriptions.length;
    const totalPage: number = Math.ceil(recordTotal / limit);
    const result: IPrescription[] = prescriptions.slice(startIndex, endIndex);
    //Fin Paginacion

    return {
      code: result.length == 0 ? 1 : 0,
      message: result.length == 0 ? 'SIN DATOS' : 'OK',
      data: result,
      page: page,
      limit: limit,
      totalPage: totalPage,
      recordTotal: recordTotal
    };
  }
}
