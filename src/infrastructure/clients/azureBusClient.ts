import { ServiceBusClient, QueueClient, Sender } from '@azure/service-bus';
import { Inject, Service } from 'typedi';
import config from '../../config';
import { IAzureBusClient } from '../../domain/interfaces/adapter/IAzureBusClient';
import { Logger } from 'winston';

@Service('AzureBusClient')
export default class AzureBusClient implements IAzureBusClient {
  @Inject('logger') private readonly logger: Logger;
  //private serviceBusClient = ServiceBusClient.createFromConnectionString(config.azureServiceBusConnectionString);

  async sendMessageQueue(
    rutUser: string,
    queueName: string,
    body: string,
    label: string,
    custom: string
  ): Promise<boolean> {
    const serviceBusClient: ServiceBusClient = ServiceBusClient.createFromConnectionString(
      config.azureServiceBusConnectionString
    );
    const queueClient: QueueClient = serviceBusClient.createQueueClient(queueName);
    const sender: Sender = queueClient.createSender();
    const response = false;
    try {
      const message: any = {
        body: body,
        label: label,
        userProperties: {
          myCustomPropertyName: custom
        }
      };

      await sender.send(message);
      this.logger.info('[' + rutUser + '] - sendQueue - exitoso. Message:' + JSON.stringify(message));
      await queueClient.close();
    } catch (error) {
      this.logger.info('[' + rutUser + '] - sendQueue - error: [' + error + ']');
    } finally {
      await serviceBusClient.close();
      return response;
    }
  }
}
