import dotenv, { DotenvConfigOutput } from 'dotenv';

// Set the NODE_ENV to 'development' by default
process.env.NODE_ENV = process.env.NODE_ENV || 'development';

const envFound: DotenvConfigOutput = dotenv.config();
if (envFound.error) {
  throw new Error('"Couldn\'t find .env file"');
}

export default {
  port: parseInt(process.env.PORT || '3000', 10),
  dbUri: process.env.DB_URI,
  rutInsuranceCo: process.env.RUTINSURANCECO,
  VSSystemCode: process.env.VSSYSTEMCODE,
  VSQueryLimit: parseInt(process.env.VSQUERYLIMIT || '30', 10),
  denounceMaxFileSize: parseInt(process.env.DENOUNCE_MAX_FILE_SIZE || '15', 10),
  azureBlobUrl: process.env.AZURE_BLOB_URL,
  azureStorageAccountName: process.env.AZURE_STORAGE_ACCOUNT_NAME,
  azureStorageAccountAccessKey: process.env.AZURE_STORAGE_ACCOUNT_ACCESS_KEY,
  denounceAppContainer: process.env.DENOUNCE_CONTAINER_NAME,
  denounceAppExtension: process.env.DENOUNCE_EXTENSION.split(','),
  azureServiceBusConnectionString: process.env.AZURE_SERVICE_BUS_CONECTION_STRING,
  azureServiceBusURL: process.env.AZURE_SERVICE_BUS_URL,
  denounceServiceBusQueueName: process.env.DENOUNCE_SERVICE_BUS_QUEUE_NAME,
  dbHost: process.env.DB_HOST,
  dbPassword: process.env.DB_PASSWORD,
  dbPort: Number(process.env.DB_PORT),
  dbUser: process.env.DB_USER,
  dbDatabase: process.env.DB_DATABASE,
  dbSchema: process.env.DB_SCHEMA,
  payrollContainer: process.env.PAYROLL_CONTAINER_NAME,
  payrollServiceBusQueueName: process.env.PAYROLL_SERVICE_BUS_QUEUE_NAME,
  serviceClientId: process.env.VIDASECURITY_SERVICE_CLIENT_ID,
  XApplicationHeader: process.env.X_APPLICATION_HEADER,
  serviciosVSURL: process.env.VS_URL_API,
  ssoURL: process.env.SSO_URL,
  ssoAdmin: {
    user: process.env.SSO_ADMIN_USER,
    password: process.env.SSO_ADMIN_PASSWORD,
    grantType: process.env.SSO_ADMIN_GRANTTYPE,
    clientId: process.env.SSO_ADMIN_CLIENTID,
    urlMaster: process.env.SSO_ADMIN_MASTER_URL,
    urlUsers: process.env.SSO_ADMIN_USERS_URL
  },
  gestorServiceURL: process.env.GESTOR_URL,
  apiVSURL: {
    apiPolicy: process.env.VS_URL_API_POLICY,
    apiClaims: process.env.VS_URL_API_CLAIM,
    apiCommissions: process.env.VS_URL_API_COMMISSIONS,
    apiCustomer: process.env.VS_URL_API_CUSTOMER,
    apiCollection: process.env.VS_URL_API_COLLECTION,
    apiBilling: process.env.VS_URL_API_BILLING,
    apiPayment: process.env.VS_URL_API_PAYMENT,
    apiSuscription: process.env.VS_URL_API_SUSCRIPTION,
    apiInsuranceRequirements: process.env.VS_URL_API_INSUREDREQ,
    apiCommon: process.env.VS_URL_API_COMMON
  },
  redis: {
    redisUrl: process.env.REDIS_URL,
    cacheTime: Number(process.env.REDISCACHETIME)
  },
  circuitBreaker: {
    cbFailureThreshold: Number(process.env.CB_FAILURETHRESHOLD),
    cbSuccessThreshold: Number(process.env.CB_SUCCESSTHRESHOLD),
    cbTimeout: Number(process.env.CB_TIMEOUT)
  },
  cors: '*',
  logs: {
    level: process.env.LOG_LEVEL || 'info'
  },
  api: {
    prefix: '/v1'
  },
  insight: {
    key: process.env.INSTRUMENTATIONKEY
  },
  cosmos: {
    endpoint: '<Your Azure Cosmos account URI>',
    key: '<Your Azure Cosmos account key>',
    databaseId: 'Tasks',
    containerId: 'Items',
    partitionKey: { kind: 'Hash', paths: ['/category'] }
  },
  commission: {
    bussinessCode: 3
  },
  nodeEnv: process.env.NODE_ENV
};
