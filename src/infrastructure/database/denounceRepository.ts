import { Inject, Service } from 'typedi';
import { IDenounceApplicationDTO as DenounceDTO } from '../../domain/interfaces/dto/v1/IDenounceApplication';
import { IDenounceFileDTO } from '../../domain/interfaces/dto/v1/IDenounceFile';
import { getManager, UpdateResult, EntityManager, DeleteResult } from 'typeorm';
import { DenounceApplication as DenounceEntity } from './entities/denounceApplication';
import denounceAppEntityConverter from './converters/denounceAppEntityConverter';
import { IError } from '../../utils/interfaces/IError';
import { IResponseDTO } from '../../utils/interfaces/IResponse';
import { DenounceFile } from './entities/denounceFile';
import denounceFileEntityConverter from './converters/denounceFileEntityConverter';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';
import { IDenounceRepository } from '../../domain/interfaces/adapter/IDenounceRepository';
import { trackSQL } from '../../loaders/insight';
import { Logger } from 'winston';
import { FindConditions } from 'typeorm/find-options/FindConditions';

@Service('DenounceRepository')
export default class DenounceRepository implements IDenounceRepository {
  @Inject('logger') private readonly logger: Logger;
  private readonly entityManager: EntityManager = getManager();

  // DenounceApplication
  async insertDenounce(denounceInput: DenounceDTO): Promise<DenounceDTO> {
    const denounceEntity: DenounceEntity = new DenounceEntity();
    denounceEntity.addFromDTO(denounceInput);
    const startTime: number = Date.now();

    const denounceSaved: DenounceEntity = await this.entityManager.save(DenounceEntity, denounceEntity);
    trackSQL({ denounce: denounceEntity }, 'insertDenounce', denounceSaved, startTime);
    return denounceAppEntityConverter(denounceSaved);
  }

  async updateDenounce(
    idDenounce: number,
    partialEntity: QueryDeepPartialEntity<DenounceEntity>
  ): Promise<IResponseDTO> {
    const startTime: number = Date.now();
    this.logger.info('updateDenounceFileStatus - FileId: ' + JSON.stringify(idDenounce));
    this.logger.info('updateDenounceFileStatus - newValues: ' + JSON.stringify(partialEntity));
    const result: UpdateResult = await this.entityManager.update(DenounceEntity, { id: idDenounce }, partialEntity);
    trackSQL({ id: idDenounce, denounce: partialEntity }, 'updateDenounce', result, startTime);
    this.logger.info('updateDenounceFileStatus - result: ' + JSON.stringify(result));

    return { code: 0, message: 'OK' };
  }

  async deleteDenounceById(idDenounceApp: number): Promise<IResponseDTO> {
    const criteria: any = { id: idDenounceApp };
    const startTime: number = Date.now();
    const response: DeleteResult = await this.entityManager.delete(DenounceEntity, criteria);
    trackSQL({ id: idDenounceApp }, 'deleteDenounceById', response, startTime);
    if (response.affected < 1) {
      throw new IError('Error al eliminar Denuncio de BD', 'DatabaseError', 1);
    }
    return { code: 0, message: 'OK' };
  }

  async getDenounceApp(idDenounceApp: number): Promise<DenounceDTO> {
    const startTime: number = Date.now();
    const denounceAppEntity: DenounceEntity = await this.entityManager.findOne(DenounceEntity, idDenounceApp, {
      relations: ['files']
    });
    trackSQL({ id: idDenounceApp }, 'getDenounceApp', denounceAppEntity, startTime);
    return denounceAppEntityConverter(denounceAppEntity);
  }

  // public async getAllDenounces(): Promise<DenounceDTO[]> {
  //   const denounces: DenounceEntity[] = await this.entityManager.find(DenounceEntity, { relations: ['files'] });
  //   const denouncesDTO: DenounceDTO[] = [];
  //   denounces.forEach((denounce) => {
  //     denouncesDTO.push(denounceAppEntityConverter(denounce));
  //   });
  //   return denouncesDTO;
  // }

  // Files
  async insertFile(denounceFileInput: IDenounceFileDTO): Promise<IDenounceFileDTO> {
    this.logger.info('Agregando archivo denuncio a BD');
    const denounceApp: DenounceEntity = await this.entityManager.findOne(
      DenounceEntity,
      denounceFileInput.denounceApplicationID
    );
    const denounceFileEntity: DenounceFile = new DenounceFile();

    denounceFileEntity.addFromDTO(denounceFileInput);
    denounceFileEntity.denounceApp = denounceApp;
    const startTime: number = Date.now();
    const denounceFileSaved: DenounceFile = await this.entityManager.save(DenounceFile, denounceFileEntity);
    trackSQL({ denounceFile: denounceFileEntity }, 'insertFile', denounceFileSaved, startTime);
    const fileSavedDTO: IDenounceFileDTO = denounceFileEntityConverter(denounceFileSaved);

    fileSavedDTO.buffer = denounceFileInput.buffer;
    fileSavedDTO.denounceApplicationID = denounceFileInput.denounceApplicationID;

    return fileSavedDTO;
  }

  // public async updateFile(denounceFileInput: IDenounceFileDTO): Promise<IDenounceFileDTO> {
  //   const denounceApp = await this.entityManager.findOne(DenounceEntity, denounceFileInput.denounceApplicationID);
  //   const denounceFileEntity = await this.entityManager.findOne(DenounceFile, denounceFileInput.id, {
  //     relations: ['denounceApp'],
  //   });
  //
  //   denounceFileEntity.addFromDTO(denounceFileInput);
  //
  //   const denounceFileSaved = await this.entityManager.save(DenounceFile, denounceFileEntity);
  //   const fileSavedDTO = denounceFileEntityConverter(denounceFileSaved);
  //   fileSavedDTO.buffer = denounceFileInput.buffer;
  //   fileSavedDTO.denounceApplicationID = denounceApp.id;
  //
  //   return fileSavedDTO;
  // }

  async deleteFile(idDenounceFile: number): Promise<IResponseDTO> {
    const startTime: number = Date.now();
    const response: DeleteResult = await this.entityManager.delete(DenounceFile, { id: idDenounceFile });
    trackSQL({ id: idDenounceFile }, 'deleteFile', response, startTime);
    if (response.affected < 1) {
      throw new IError('Error al eliminar File de BD', 'DatabaseError', 1);
    }
    return { code: 0, message: 'OK' };
  }

  async getFileList(idDenounceApp: number): Promise<IDenounceFileDTO[]> {
    //TODO:Ver si hace falta
    let files: DenounceFile[];
    const startTime: number = Date.now();
    const findConditions: FindConditions<DenounceFile>[] = [];
    findConditions.push();
    if (idDenounceApp) {
      files = await this.entityManager.find(DenounceFile, {
        relations: ['denounceApp']
      });
    } else {
      files = await this.entityManager.find(DenounceFile, {
        where: findConditions,
        relations: ['denounceApp']
      });
    }
    trackSQL({ id: idDenounceApp }, 'getFileList', files, startTime);
    const filesDTO: IDenounceFileDTO[] = [];
    files.forEach((file: DenounceFile) => {
      filesDTO.push(denounceFileEntityConverter(file));
    });

    return filesDTO;
  }

  async getDenounceFile(idFile: number): Promise<IDenounceFileDTO> {
    const startTime: number = Date.now();
    this.logger.info('getDenounceFile - idFile: ' + JSON.stringify(idFile));
    const file: DenounceFile = await this.entityManager.findOne(DenounceFile, idFile, { relations: ['denounceApp'] });
    trackSQL({ id: idFile }, 'getDenounceFile', file, startTime);
    this.logger.info('getDenounceFile - result: ' + JSON.stringify(file));
    return denounceFileEntityConverter(file);
  }

  async updateFiles(idDenounceApp: number, partialEntity: QueryDeepPartialEntity<DenounceFile>): Promise<IResponseDTO> {
    const startTime: number = Date.now();
    const result: UpdateResult = await this.entityManager.update(
      DenounceFile,
      { denounceAppId: idDenounceApp },
      partialEntity
    );
    trackSQL({ id: idDenounceApp, denounceFile: partialEntity }, 'updateFiles', result, startTime);
    this.logger.info('update - result: ' + JSON.stringify(result));

    return { code: 0, message: 'OK' };
  }
}
