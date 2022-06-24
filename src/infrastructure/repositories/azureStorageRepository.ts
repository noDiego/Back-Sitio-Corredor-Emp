import path from 'path';
import config from '../../config';
import { Container, Inject, Service } from 'typedi';
import NodeClient from 'applicationinsights/out/Library/NodeClient';
import {
  BlobClient,
  BlobDeleteResponse,
  BlobDownloadResponseParsed,
  BlobServiceClient,
  BlobUploadCommonResponse,
  BlockBlobClient,
  ContainerClient,
  StorageSharedKeyCredential
} from '@azure/storage-blob';
import { IAzureUploadResult, IResponseDTO } from '../../utils/interfaces/IResponse';
import { IDenounceFileDTO } from '../../domain/interfaces/dto/v1/IDenounceFile';
import Utils from '../../utils/utils';
import internal from 'stream';
import { Logger } from 'winston';
import { IMulterFile } from '../../domain/interfaces/dto/v3/IMulterFile';

@Service('AzureStorageRepository')
export default class AzureStorageRepository {
  @Inject('logger') private readonly logger: Logger;

  private storageSharedCredential: StorageSharedKeyCredential = new StorageSharedKeyCredential(
    config.azureStorageAccountName,
    config.azureStorageAccountAccessKey
  );
  private blobServiceClient: BlobServiceClient = new BlobServiceClient(
    config.azureBlobUrl,
    this.storageSharedCredential
  );

  public async getFile(blobName: string, rutUser: string, container: string): Promise<Buffer> {
    const insightClient: NodeClient = Container.get('InsightClient');
    this.logger.info('[' + rutUser + '] - starting getFile from storage - blobName: [' + blobName + ']');
    const containerClient: ContainerClient = this.blobServiceClient.getContainerClient(container);

    const blobClient: BlobClient = containerClient.getBlobClient(blobName);
    const stream: any = await blobClient
      .download(0)
      .then((response: BlobDownloadResponseParsed) => {
        this.logger.error('[' + rutUser + '] - getFile from storage OK - blobName: [' + blobName + ']');
        insightClient.trackEvent({
          name: 'Sitio Corredores - Backend - downloadFile',
          properties: { success: true, path: blobName, requestId: response.requestId }
        });
        return response.readableStreamBody;
      })
      .catch((error: any) => {
        insightClient.trackEvent({
          name: 'Sitio Corredores - Backend - downloadFile',
          properties: { success: false, path: blobName, error: error }
        });
        this.logger.error('[' + rutUser + '] - getFile from storage - error: [' + error + ']');
        throw error;
      });
    return await Utils.streamToBuffer(stream);
  }

  public async deleteFile(file: IDenounceFileDTO, rutUser: string, container: string): Promise<IResponseDTO> {
    const insightClient: NodeClient = Container.get('InsightClient');
    this.logger.info('[' + rutUser + '] - starting deleteFile from storage - blobName: [' + file.blobName + ']');
    const containerClient: ContainerClient = this.blobServiceClient.getContainerClient(container);

    const blobClient: BlobClient = containerClient.getBlobClient(file.blobName);
    return await blobClient
      .delete()
      .then((response: BlobDeleteResponse) => {
        insightClient.trackEvent({
          name: 'Sitio Corredores - Backend - deleteBlob delete ok',
          properties: {
            success: true,
            denounceAppId: file.denounceApplicationID,
            path: file.blobName,
            filename: file.name,
            requestId: response.requestId
          }
        });
        this.logger.info('[' + rutUser + ']. deleteFile OK. reqId: ' + response.requestId);
        return { success: true, code: 0, message: 'OK' };
      })
      .catch((error: any) => {
        insightClient.trackEvent({
          name: 'Sitio Corredores - Backend - deleteBlob delete error',
          properties: {
            success: false,
            denounceAppId: file.denounceApplicationID,
            path: file.blobName,
            filename: file.name,
            response: error
          }
        });
        this.logger.error('[' + rutUser + '] - deleteFile from storage - error: [' + error + ']');
        return { success: false, code: 1, message: error.message };
      });
  }

  public async uploadFile(
    file: IMulterFile,
    denounceAppId: number,
    container: string,
    directoryPath: string,
    allowedExtensions: string[]
  ): Promise<IAzureUploadResult> {
    const insightClient: NodeClient = Container.get('InsightClient');
    try {
      if (!this.isValidExtension(path.extname(file.originalname), allowedExtensions)) {
        throw 'Formato de Archivo no Permitido';
      }
      const containerClient: ContainerClient = this.blobServiceClient.getContainerClient(container);

      const blockBlobClient: BlockBlobClient = containerClient.getBlockBlobClient(directoryPath);

      const readStream: internal.Readable = await Utils.bufferToStream(file.buffer);

      const uploadBlobResponse: BlobUploadCommonResponse = await blockBlobClient.uploadStream(
        readStream,
        file.buffer.byteLength
      );

      insightClient.trackEvent({
        name: 'Sitio Corredores - Backend - uploadFile ok',
        properties: {
          success: true,
          path: denounceAppId,
          filename: file.originalname,
          requestId: uploadBlobResponse.requestId
        }
      });
      insightClient.flush();

      return {
        success: true,
        details: uploadBlobResponse
      };
    } catch (err) {
      const response: any = {
        success: false,
        error: err
      };
      insightClient.trackEvent({
        name: 'Sitio Corredores - Backend - uploadFile Error',
        properties: { success: false, path: denounceAppId, filename: file.originalname, response: response }
      });
      insightClient.flush();

      return response;
    }
  }

  private isValidExtension(extension: string, allowedExtensions: string[]): boolean {
    if (allowedExtensions.find((element: string) => element === extension)) {
      return true;
    } else {
      return false;
    }
  }

  async validateContainer(container: string): Promise<boolean> {
    const containerClient: ContainerClient = this.blobServiceClient.getContainerClient(container);
    return containerClient.exists();
  }
}
