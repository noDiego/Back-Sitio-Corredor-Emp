import { startGlobals } from '../../helpers/globalMocks';
import { Container } from 'typedi';
import AzureBusClient from '../../../src/infrastructure/clients/azureBusClient';

describe('AzureBusClient', () => {
  let azureBusClient: AzureBusClient;

  beforeAll(async () => {
    await startGlobals();
    azureBusClient = Container.get(AzureBusClient);
  });

  it('AzureBusClient be defined', () => {
    expect(azureBusClient).toBeDefined();
  });
  //
  // it('sendMessageQueue OK', () => {
  //     azureBusClient.sendMessageQueue('16813306', 'cola', "body", 'label','custom');
  // });
});
