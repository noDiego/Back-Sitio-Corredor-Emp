import { Inject, Service } from 'typedi';
import { IHoldingDTO } from '../../domain/interfaces/dto/v1/IHolding';
import { IUserSSO } from '../../domain/interfaces/dto/v3/IUserSSO';
import { IHoldingService } from '../../domain/interfaces/services/IHoldingService';
import { IContractor } from '../../domain/interfaces/dto/v3/IContractor';
import { Logger } from '../../loaders/logger';

@Service()
export default class HoldingService implements IHoldingService {
  @Inject('logger') private readonly logger: Logger;

  async getHolding(user: IUserSSO): Promise<IHoldingDTO[]> {
    if (!user) return;
    const listaContractor1: IContractor[] = [];
    listaContractor1.push({
      name: 'BUSSENIUS Y TRINCADO LIMITADA',
      rut: '78.150.860-8',
      address: 'Huérfanos 1273, Santiago',
      bussinessLine: 'Asesoria',
      contactName: 'GASTON DAMIAN PAREDES ROJAS',
      contactPhone: '9967845634',
      contactEmail: 'gaston.paredes@BT.com',
      totalPolicies: 1
    });

    const listaContractor2: IContractor[] = [];
    listaContractor2.push({
      name: 'BANCO CENTRAL DE CHILE',
      rut: '97.029.000-1',
      address: 'Agustinas 1180, Santiago Chile',
      bussinessLine: 'Servicios Financieros',
      contactName: 'DE SEGUROS LTDA. MERCER CORREDORES',
      contactPhone: '9967845635',
      contactEmail: 'mercercorredores@bancocentral.cl',
      totalPolicies: 13
    });

    const listaHolding: IHoldingDTO[] = [];
    listaHolding.push({
      code: '283054',
      name: 'BANCO CENTRAL DE CHILE ',
      totalContractors: 1,
      contractors: listaContractor2
    });
    listaHolding.push({
      code: '281683',
      name: 'OTEC',
      totalContractors: 1,
      contractors: listaContractor1
    });

    return listaHolding;
  }
}
