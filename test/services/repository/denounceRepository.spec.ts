import { startGlobals } from '../../helpers/globalMocks';
import DenounceRepository from '../../../src/infrastructure/database/denounceRepository';
import { DenounceApplication } from '../../../src/infrastructure/database/entities/denounceApplication';
import denounceAppEntityConverter from '../../../src/infrastructure/database/converters/denounceAppEntityConverter';
import { Container } from 'typedi';
import typeorm = require('typeorm');
import { DenounceFile } from '../../../src/infrastructure/database/entities/denounceFile';
import denounceFileEntityConverter from '../../../src/infrastructure/database/converters/denounceFileEntityConverter';

const denounceAppObject: DenounceApplication = {
  files: [],
  addFromDTO(denounceInput): void {},
  id: 1,
  consignment: null,
  applicationNumber: null,
  policy: 123456,
  renovation: null,
  insuredRut: '14.363.681-K',
  insuredName: 'FABIOLA',
  insuredLastname: 'BERRIOS ANTILAF',
  insuredEmail: 'desa@vidasecurity.cl',
  denounceTypeCode: '1',
  denounceType: '1',
  beneficiaryRut: '11.111.111-1',
  beneficiaryName: 'Juan Perez',
  userRut: '11.111.111-1',
  userName: '2 brains',
  userEmail: '111111111@2brains.cl',
  plan: 'plan test',
  planCode: '001',
  amount: 10000,
  comment: 'comentario test',
  creationDate: new Date('2020-10-06T13:34:41.000Z'),
  status: 'PROSPECTO',
  groupCode: '1',
  paymentId: null
};

const denounceFileObject: DenounceFile = {
  blobName: '37/DocumentoPrueba.pdf',
  name: 'DocumentoPrueba.pdf',
  extension: 'pdf',
  mimeType: 'application/pdf',
  creationDate: new Date('2020-10-07T01:55:54.000Z'),
  status: 'PROSPECTO',
  denounceApp: denounceAppObject,
  denounceAppId: 37,
  id: 61,
  addFromDTO(denounceInput): void {}
};

describe('DenounceRepository tests', () => {
  beforeAll(() => {
    startGlobals(null, true);
  });

  afterEach(() => {
    Container.remove(DenounceRepository);
  });

  const denounceManagerMock = {
    //Mock de getManager para denounceApplication
    save: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    find: jest.fn().mockReturnThis(),
    findOne: jest.fn().mockReturnThis(),
    findByIds: jest.fn().mockReturnThis()
  };

  describe('DenounceApplication', () => {
    it('DenounceRepository define OK', () => {
      const repoInstance = Container.get(DenounceRepository);
      expect(repoInstance).toBeDefined();
    });

    it('insert DenounceApplication OK', async () => {
      denounceManagerMock.save = jest.fn().mockReturnValue(denounceAppObject); //Mock de funcion q se usara en test
      typeorm.getManager = jest.fn().mockReturnValue(denounceManagerMock); //se vuelve a setear getManager con funcion actualizada (mock)

      const repoInstance = Container.get(DenounceRepository); //Instancia generada siempre luego de mock de getManager
      const denounceApplicationDTO = denounceAppEntityConverter(denounceAppObject); //Dato de entrada para insert

      const response = await repoInstance.insertDenounce(denounceApplicationDTO);
      expect(response.policy).toBe(denounceAppObject.policy);
      expect(response.insuredRut).toBe(denounceAppObject.insuredRut);
    });

    it('update DenounceApplication OK', async () => {
      denounceManagerMock.update = jest.fn().mockReturnValue({ affected: 1 });
      typeorm.getManager = jest.fn().mockReturnValue(denounceManagerMock);
      const repoInstance = Container.get(DenounceRepository);

      const response = await repoInstance.updateDenounce(1, { status: 'EN_PROCESO' });
      expect(response.code).toBe(0);
    });

    it('delete DenounceApplication OK', async () => {
      denounceManagerMock.delete = jest.fn().mockReturnValue({ affected: 1 });
      typeorm.getManager = jest.fn().mockReturnValue(denounceManagerMock);

      const repoInstance = Container.get(DenounceRepository);

      const response = await repoInstance.deleteDenounceById(1);
      expect(response.code).toBe(0);
    });

    it('get DenounceApplication OK', async () => {
      denounceManagerMock.findOne = jest.fn().mockReturnValue(denounceAppObject);
      typeorm.getManager = jest.fn().mockReturnValue(denounceManagerMock);

      const repoInstance = Container.get(DenounceRepository);

      const response = await repoInstance.getDenounceApp(1);
      expect(response.policy).toBe(denounceAppObject.policy);
      expect(response.userRut).toBe(denounceAppObject.userRut);
    });
  });

  describe('DenounceFiles', () => {
    it('insert DenounceFile OK', async () => {
      denounceManagerMock.save = jest.fn().mockReturnValue(denounceFileObject); //Mock de funcion q se usara en test
      typeorm.getManager = jest.fn().mockReturnValue(denounceManagerMock); //se vuelve a setear getManager con funcion actualizada (mock)

      const repoInstance = Container.get(DenounceRepository); //Instancia generada siempre luego de mock de getManager
      const denounceFileDTO = denounceFileEntityConverter(denounceFileObject); //Dato de entrada para insert

      const response = await repoInstance.insertFile(denounceFileDTO);
      expect(response.blobName).toBe(denounceFileObject.blobName);
      expect(response.creationDate).toBe(denounceFileObject.creationDate);
    });

    it('update DenounceFile OK', async () => {
      denounceManagerMock.update = jest.fn().mockReturnValue({ affected: 1 });
      typeorm.getManager = jest.fn().mockReturnValue(denounceManagerMock);
      const repoInstance = Container.get(DenounceRepository);

      const response = await repoInstance.updateFiles(1, { status: 'EN_PROCESO' });
      expect(response.code).toBe(0);
    });

    it('delete DenounceFile OK', async () => {
      denounceManagerMock.delete = jest.fn().mockReturnValue({ affected: 1 });
      typeorm.getManager = jest.fn().mockReturnValue(denounceManagerMock);

      const repoInstance = Container.get(DenounceRepository);

      const response = await repoInstance.deleteFile(1);
      expect(response.code).toBe(0);
    });

    it('get DenounceFile OK', async () => {
      denounceManagerMock.findOne = jest.fn().mockReturnValue(denounceFileObject);
      typeorm.getManager = jest.fn().mockReturnValue(denounceManagerMock);

      const repoInstance = Container.get(DenounceRepository);

      const response = await repoInstance.getDenounceFile(1);
      expect(response.name).toBe(denounceFileObject.name);
      expect(response.creationDate).toBe(denounceFileObject.creationDate);
    });
  });
});
