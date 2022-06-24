import { createConnection } from 'typeorm';
import config from '../config';
import { Functionality } from '../infrastructure/database/entities/functionality';
import { Profile } from '../infrastructure/database/entities/profile';
import { Client } from '../infrastructure/database/entities/client';
import { User } from '../infrastructure/database/entities/user';
import { DenounceApplication } from '../infrastructure/database/entities/denounceApplication';
import { DenounceFile } from '../infrastructure/database/entities/denounceFile';
import { Payroll } from '../infrastructure/database/entities/payroll';
import { PayrollDetail } from '../infrastructure/database/entities/payrollDetail';

export default async (): Promise<void> => {
  await createConnection({
    type: 'mssql',
    host: config.dbHost,
    port: config.dbPort,
    username: config.dbUser,
    password: config.dbPassword,
    database: config.dbDatabase,
    schema: config.dbSchema,
    options: {
      enableArithAbort: true
    },
    entities: [User, Client, Functionality, Profile, DenounceApplication, DenounceFile, Payroll, PayrollDetail],
    synchronize: true
  });
};
