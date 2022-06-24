export interface IAzureBusClient {
  sendMessageQueue(rutUser: string, queueName: string, body: string, label: string, custom: string): Promise<boolean>;
}
