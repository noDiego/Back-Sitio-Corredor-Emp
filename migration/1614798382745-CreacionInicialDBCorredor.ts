import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreacionInicialDBcorredor1614798382745 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createSchema('corredorTest', true);

    await queryRunner.createTable(
      new Table({
        name: 'corredorTest.User',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'rut',
            type: 'nvarchar',
            length: '15'
          },
          {
            name: 'type',
            type: 'nvarchar',
            length: '50',
            isNullable: false
          },
          {
            name: 'name',
            type: 'nvarchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'email',
            type: 'nvarchar',
            length: '62',
            isNullable: false
          },
          {
            name: 'status',
            type: 'nvarchar',
            length: '10',
            isNullable: false,
            // eslint-disable-next-line @typescript-eslint/quotes
            default: "'ENABLED'"
          }
        ]
      }),
      true
    );
    await queryRunner.createIndex(
      'corredorTest.User',
      new TableIndex({
        name: 'IDX_USER',
        columnNames: ['id']
      })
    );

    await queryRunner.createTable(
      new Table({
        name: 'corredorTest.Client',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'rut',
            type: 'nvarchar',
            length: '15'
          },
          {
            name: 'name',
            type: 'nvarchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'type',
            type: 'nvarchar',
            length: '62',
            isNullable: false
          },
          {
            name: 'policies',
            type: 'ntext',
            isNullable: true
          },
          {
            name: 'seeAll',
            type: 'bit',
            isNullable: false,
            default: '0'
          },
          {
            name: 'status',
            type: 'nvarchar',
            length: '10',
            isNullable: false,
            // eslint-disable-next-line @typescript-eslint/quotes
            default: "'ENABLED'"
          },
          {
            name: 'userId',
            type: 'int'
          }
        ]
      }),
      true
    );
    await queryRunner.createIndex(
      'corredorTest.Client',
      new TableIndex({
        name: 'IDX_CLIENT',
        columnNames: ['id']
      })
    );
    await queryRunner.createForeignKey(
      'corredorTest.Client',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'corredorTest.User',
        onDelete: 'NO ACTION'
      })
    );

    await queryRunner.createTable(
      new Table({
        name: 'corredorTest.Profile',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'description',
            type: 'nvarchar',
            length: '250'
          },
          {
            name: 'status',
            type: 'nvarchar',
            length: '10',
            isNullable: false,
            // eslint-disable-next-line @typescript-eslint/quotes
            default: "'ENABLED'"
          }
        ]
      }),
      true
    );
    await queryRunner.createIndex(
      'corredorTest.Profile',
      new TableIndex({
        name: 'IDX_PROFILE',
        columnNames: ['id']
      })
    );

    await queryRunner.createTable(
      new Table({
        name: 'corredorTest.Functionality',
        columns: [
          {
            name: 'code',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'description',
            type: 'nvarchar',
            length: '250'
          },
          {
            name: 'status',
            type: 'nvarchar',
            length: '10',
            isNullable: false,
            // eslint-disable-next-line @typescript-eslint/quotes
            default: "'ENABLED'"
          }
        ]
      }),
      true
    );
    await queryRunner.createIndex(
      'corredorTest.Functionality',
      new TableIndex({
        name: 'IDX_FUNCTIONALITY',
        columnNames: ['id']
      })
    );

    await queryRunner.createTable(
      new Table({
        name: 'corredorTest.Profile_Functionalities_Functionality',
        columns: [
          {
            name: 'profileId',
            type: 'int',
            isNullable: false
          },
          {
            name: 'functionalityCode',
            type: 'int',
            isNullable: false
          }
        ]
      }),
      true
    );
    await queryRunner.createIndex(
      'corredorTest.Profile_Functionalities_Functionality',
      new TableIndex({
        name: 'IDX_PROFILE_FUNCTIONALITY',
        columnNames: ['profileId', 'functionalityCode']
      })
    );
    await queryRunner.createForeignKey(
      'corredorTest.Profile_Functionalities_Functionality',
      new TableForeignKey({
        columnNames: ['profileId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'corredorTest.Profile',
        onDelete: 'CASCADE'
      })
    );
    await queryRunner.createForeignKey(
      'corredorTest.Profile_Functionalities_Functionality',
      new TableForeignKey({
        columnNames: ['functionalityCode'],
        referencedColumnNames: ['code'],
        referencedTableName: 'corredorTest.Functionality',
        onDelete: 'CASCADE'
      })
    );

    await queryRunner.createTable(
      new Table({
        name: 'corredorTest.User_Profiles_Profile',
        columns: [
          {
            name: 'userId',
            type: 'int',
            isNullable: false
          },
          {
            name: 'profileId',
            type: 'int',
            isNullable: false
          }
        ]
      }),
      true
    );
    await queryRunner.createIndex(
      'corredorTest.User_Profiles_Profile',
      new TableIndex({
        name: 'IDX_USER_PROFILE',
        columnNames: ['userId', 'profileId']
      })
    );
    await queryRunner.createForeignKey(
      'corredorTest.User_Profiles_Profile',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'corredorTest.User',
        onDelete: 'CASCADE'
      })
    );
    await queryRunner.createForeignKey(
      'corredorTest.User_Profiles_Profile',
      new TableForeignKey({
        columnNames: ['profileId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'corredorTest.Profile',
        onDelete: 'CASCADE'
      })
    );

    await queryRunner.createTable(
      new Table({
        name: 'corredorTest.Denounce_application',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'consignment',
            type: 'nvarchar',
            length: '50'
          },
          {
            name: 'policy',
            type: 'int'
          },
          {
            name: 'renovation',
            type: 'int'
          },
          {
            name: 'insuredRut',
            type: 'nvarchar',
            length: '20',
            isNullable: false
          },
          {
            name: 'insuredEmail',
            type: 'nvarchar',
            length: '62',
            isNullable: false
          },
          {
            name: 'denounceTypeCode',
            type: 'nvarchar',
            length: '50',
            isNullable: false
          },
          {
            name: 'denounceType',
            type: 'nvarchar',
            length: '30',
            isNullable: false
          },
          {
            name: 'beneficiaryRut',
            type: 'nvarchar',
            length: '20'
          },
          {
            name: 'userRut',
            type: 'nvarchar',
            length: '20',
            isNullable: false
          },
          {
            name: 'userName',
            type: 'nvarchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'userEmail',
            type: 'nvarchar',
            length: '62',
            isNullable: false
          },
          {
            name: 'amount',
            type: 'int'
          },
          {
            name: 'creationDate',
            type: 'datetime',
            isNullable: false
          },
          {
            name: 'status',
            type: 'nvarchar',
            length: '20',
            isNullable: false,
            // eslint-disable-next-line @typescript-eslint/quotes
            default: "'ENABLED'"
          },
          {
            name: 'insuredName',
            type: 'nvarchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'insuredLastname',
            type: 'nvarchar',
            length: '100',
            isNullable: false
          },
          {
            name: 'beneficiaryName',
            type: 'nvarchar',
            length: '200'
          },
          {
            name: 'plan',
            type: 'nvarchar',
            length: '255'
          },
          {
            name: 'planCode',
            type: 'nvarchar',
            length: '255'
          },
          {
            name: 'applicationNumber',
            type: 'int'
          },
          {
            name: 'paymentId',
            type: 'int'
          },
          {
            name: 'groupCode',
            type: 'nvarchar',
            length: '100'
          },
          {
            name: 'comment',
            type: 'nvarchar',
            length: '300'
          }
        ]
      }),
      true
    );
    await queryRunner.createIndex(
      'corredorTest.Denounce_application',
      new TableIndex({
        name: 'IDX_DENOUNCE_APP',
        columnNames: ['id']
      })
    );

    await queryRunner.createTable(
      new Table({
        name: 'corredorTest.Denounce_file',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'blobName',
            type: 'nvarchar',
            length: '250',
            isNullable: false
          },
          {
            name: 'name',
            type: 'nvarchar',
            length: '255',
            isNullable: false
          },
          {
            name: 'extension',
            type: 'nvarchar',
            length: '10',
            isNullable: false
          },
          {
            name: 'mimeType',
            type: 'nvarchar',
            length: '50',
            isNullable: false
          },
          {
            name: 'creationDate',
            type: 'datetime',
            isNullable: false
          },
          {
            name: 'status',
            type: 'nvarchar',
            length: '20',
            isNullable: false,
            // eslint-disable-next-line @typescript-eslint/quotes
            default: "'ENABLED'"
          },
          {
            name: 'denounceAppId',
            type: 'int',
            isNullable: false
          }
        ]
      }),
      true
    );
    await queryRunner.createIndex(
      'corredorTest.Denounce_file',
      new TableIndex({
        name: 'IDX_DENOUNCE_FILE',
        columnNames: ['id']
      })
    );
    await queryRunner.createForeignKey(
      'corredorTest.Denounce_file',
      new TableForeignKey({
        columnNames: ['denounceAppId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'corredorTest.Denounce_application',
        onDelete: 'CASCADE'
      })
    );

    await queryRunner.createTable(
      new Table({
        name: 'corredorTest.Payroll',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'creationDate',
            type: 'datetime',
            isNullable: false
          },
          {
            name: 'type',
            type: 'nvarchar',
            length: '50',
            isNullable: false
          },
          {
            name: 'typeDescription',
            type: 'nvarchar',
            length: '50'
          },
          {
            name: 'exclusionType',
            type: 'nvarchar',
            length: '50'
          },
          {
            name: 'blobName',
            type: 'nvarchar',
            length: '250'
          },
          {
            name: 'fileName',
            type: 'nvarchar',
            length: '255'
          },
          {
            name: 'fileExtension',
            type: 'nvarchar',
            length: '10'
          },
          {
            name: 'fileMimeType',
            type: 'nvarchar',
            length: '100'
          },
          {
            name: 'policy',
            type: 'int'
          },
          {
            name: 'contractorRut',
            type: 'nvarchar',
            length: '255'
          },
          {
            name: 'contractorName',
            type: 'nvarchar',
            length: '255'
          },
          {
            name: 'subsidiaryRut',
            type: 'nvarchar',
            length: '255'
          },
          {
            name: 'subsidiaryName',
            type: 'nvarchar',
            length: '255'
          },
          {
            name: 'plan',
            type: 'nvarchar',
            length: '255'
          },
          {
            name: 'planCode',
            type: 'nvarchar',
            length: '255'
          },
          {
            name: 'group',
            type: 'nvarchar',
            length: '255'
          },
          {
            name: 'groupName',
            type: 'nvarchar',
            length: '255'
          },
          {
            name: 'capitalRequired',
            type: 'bit',
            isNullable: false,
            default: '0'
          },
          {
            name: 'incomeRequired',
            type: 'bit',
            isNullable: false,
            default: '0'
          },
          {
            name: 'status',
            type: 'nvarchar',
            length: '20',
            isNullable: false,
            // eslint-disable-next-line @typescript-eslint/quotes
            default: "'ENABLED'"
          },
          {
            name: 'invalidRows',
            type: 'int',
            isNullable: false,
            default: '0'
          },
          {
            name: 'subsidiaryCode',
            type: 'int'
          }
        ]
      }),
      true
    );
    await queryRunner.createIndex(
      'corredorTest.Payroll',
      new TableIndex({
        name: 'IDX_PAYROLL',
        columnNames: ['id']
      })
    );

    await queryRunner.createTable(
      new Table({
        name: 'corredorTest.Payroll_detail',
        columns: [
          {
            name: 'id',
            type: 'int',
            isPrimary: true,
            isGenerated: true,
            generationStrategy: 'increment'
          },
          {
            name: 'rowNumber',
            type: 'int'
          },
          {
            name: 'payrollId',
            type: 'int',
            isNullable: false
          },
          {
            name: 'creationDate',
            type: 'datetime',
            isNullable: false
          },
          {
            name: 'insuredRut',
            type: 'int',
            isNullable: false
          },
          {
            name: 'insuredDV',
            type: 'nvarchar',
            length: '1',
            isNullable: false
          },
          {
            name: 'dependentRut',
            type: 'int'
          },
          {
            name: 'dependentDV',
            type: 'nvarchar',
            length: '1'
          },
          {
            name: 'name',
            type: 'nvarchar',
            length: '100'
          },
          {
            name: 'lastname',
            type: 'nvarchar',
            length: '100'
          },
          {
            name: 'birthday',
            type: 'datetime'
          },
          {
            name: 'gender',
            type: 'nvarchar',
            length: '50'
          },
          {
            name: 'initDate',
            type: 'datetime'
          },
          {
            name: 'endDate',
            type: 'datetime'
          },
          {
            name: 'email',
            type: 'nvarchar',
            length: '62'
          },
          {
            name: 'bank',
            type: 'nvarchar',
            length: '2'
          },
          {
            name: 'bankName',
            type: 'nvarchar',
            length: '50'
          },
          {
            name: 'bankAccountNumber',
            type: 'int'
          },
          {
            name: 'kinship',
            type: 'nvarchar',
            length: '25'
          },
          {
            name: 'phone',
            type: 'nvarchar',
            length: '12'
          },
          {
            name: 'isapre',
            type: 'nvarchar',
            length: '75'
          },
          {
            name: 'status',
            type: 'nvarchar',
            length: '20',
            isNullable: false,
            // eslint-disable-next-line @typescript-eslint/quotes
            default: "'ENABLED'"
          },
          {
            name: 'invalidDetail',
            type: 'nvarchar',
            length: '255'
          },
          {
            name: 'contractDate',
            type: 'datetime'
          },
          {
            name: 'income',
            type: 'bigint'
          },
          {
            name: 'bigint',
            type: 'bigint'
          }
        ]
      }),
      true
    );
    await queryRunner.createIndex(
      'corredorTest.Payroll_detail',
      new TableIndex({
        name: 'IDX_PAYROLL_DETAIL',
        columnNames: ['id']
      })
    );
    await queryRunner.createForeignKey(
      'corredorTest.Payroll_detail',
      new TableForeignKey({
        columnNames: ['payrollId'],
        referencedColumnNames: ['id'],
        referencedTableName: 'corredorTest.Payroll',
        onDelete: 'CASCADE'
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    //se elimina elementos tabla Profile_Functionalities_Functionality
    const tableProfileFunctionality: Table = await queryRunner.getTable(
      'corredorTest.Profile_Functionalities_Functionality'
    );
    const foreignKeyProfileFunctionality1: TableForeignKey = tableProfileFunctionality.foreignKeys.find(
      (fk: TableForeignKey) => fk.columnNames.indexOf('profileId') !== -1
    );
    const foreignKeyProfileFunctionality2: TableForeignKey = tableProfileFunctionality.foreignKeys.find(
      (fk: TableForeignKey) => fk.columnNames.indexOf('functionalityCode') !== -1
    );
    await queryRunner.dropForeignKey(
      'corredorTest.Profile_Functionalities_Functionality',
      foreignKeyProfileFunctionality1
    );
    await queryRunner.dropForeignKey(
      'corredorTest.Profile_Functionalities_Functionality',
      foreignKeyProfileFunctionality2
    );
    await queryRunner.dropIndex('corredorTest.Profile_Functionalities_Functionality', 'IDX_PROFILE_FUNCTIONALITY');
    await queryRunner.dropTable('corredorTest.Profile_Functionalities_Functionality', false, true);

    //se elimina elementos tabla User_Profiles_Profile
    const tableUserProfile: Table = await queryRunner.getTable('corredorTest.User_Profiles_Profile');
    const foreignKeyUserProfile1: TableForeignKey = tableUserProfile.foreignKeys.find(
      (fk: TableForeignKey) => fk.columnNames.indexOf('userId') !== -1
    );
    const foreignKeyUserProfile2: TableForeignKey = tableUserProfile.foreignKeys.find(
      (fk: TableForeignKey) => fk.columnNames.indexOf('profileId') !== -1
    );
    await queryRunner.dropForeignKey('corredorTest.User_Profiles_Profile', foreignKeyUserProfile1);
    await queryRunner.dropForeignKey('corredorTest.User_Profiles_Profile', foreignKeyUserProfile2);
    await queryRunner.dropIndex('corredorTest.User_Profiles_Profile', 'IDX_USER_PROFILE');
    await queryRunner.dropTable('corredorTest.User_Profiles_Profile', false, true);

    //se elimina elementos tabla Functionality
    await queryRunner.dropIndex('corredorTest.Functionality', 'IDX_FUNCTIONALITY');
    await queryRunner.dropTable('corredorTest.Functionality', false, true);

    //se elimina elementos tabla Profile
    await queryRunner.dropIndex('corredorTest.Profile', 'IDX_PROFILE');
    await queryRunner.dropTable('corredorTest.Profile', false, true);

    //se elimina elementos tabla Client
    const tableClient: Table = await queryRunner.getTable('corredorTest.Client');
    const foreignKeyClient: TableForeignKey = tableClient.foreignKeys.find(
      (fk: TableForeignKey) => fk.columnNames.indexOf('userId') !== -1
    );
    await queryRunner.dropForeignKey('corredorTest.Client', foreignKeyClient);
    await queryRunner.dropIndex('corredorTest.Client', 'IDX_CLIENT');
    await queryRunner.dropTable('corredorTest.Client', false, true);

    //se elimina elementos tabla User
    await queryRunner.dropIndex('corredorTest.User', 'IDX_USER');
    await queryRunner.dropTable('corredorTest.User', false, true);

    //se elimina elementos tabla Denounce_file
    const tableDenounce_file: Table = await queryRunner.getTable('corredorTest.Denounce_file');
    const foreignKeyDenounce_file: TableForeignKey = tableDenounce_file.foreignKeys.find(
      (fk: TableForeignKey) => fk.columnNames.indexOf('denounceAppId') !== -1
    );
    await queryRunner.dropForeignKey('corredorTest.Denounce_file', foreignKeyDenounce_file);
    await queryRunner.dropIndex('corredorTest.Denounce_file', 'IDX_DENOUNCE_FILE');
    await queryRunner.dropTable('corredorTest.Denounce_file', false, true);

    //se elimina elementos tabla Denounce_application
    await queryRunner.dropIndex('corredorTest.Denounce_application', 'IDX_DENOUNCE_APP');
    await queryRunner.dropTable('corredorTest.Denounce_application', false, true);

    //se elimina elementos tabla Payroll_detail
    const tablePayroll_detail: Table = await queryRunner.getTable('corredorTest.Payroll_detail');
    const foreignKeyPayroll_detail: TableForeignKey = tablePayroll_detail.foreignKeys.find(
      (fk: TableForeignKey) => fk.columnNames.indexOf('payrollId') !== -1
    );
    await queryRunner.dropForeignKey('corredorTest.Payroll_detail', foreignKeyPayroll_detail);
    await queryRunner.dropIndex('corredorTest.Payroll_detail', 'IDX_PAYROLL_DETAIL');
    await queryRunner.dropTable('corredorTest.Payroll_detail', false, true);

    //se elimina elementos tabla Payroll
    await queryRunner.dropIndex('corredorTest.Payroll', 'IDX_PAYROLL');
    await queryRunner.dropTable('corredorTest.Payroll', false, true);

    await queryRunner.dropSchema('corredorTest', false, true);
  }
}
