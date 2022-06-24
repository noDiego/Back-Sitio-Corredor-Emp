import { Column, Entity, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { PayrollDetail } from './payrollDetail';

@Entity()
export class Payroll {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  creationDate: Date;

  @Column({ length: 50 })
  type: string;

  @Column({ length: 50, nullable: true })
  typeDescription: string;

  @Column({ length: 50, nullable: true })
  exclusionType: string;

  @Column({ length: 250, nullable: true })
  blobName: string;

  @Column({ nullable: true })
  fileName: string;

  @Column({ length: 10, nullable: true })
  fileExtension: string;

  @Column({ length: 100, nullable: true })
  fileMimeType: string;

  @Column({ nullable: true })
  policy: number;

  @Column({ nullable: true })
  contractorRut: string;

  @Column({ nullable: true })
  contractorName: string;

  @Column({ nullable: true })
  subsidiaryRut: string;

  @Column({ nullable: true })
  subsidiaryName: string;

  @Column({ nullable: true })
  subsidiaryCode: number;

  @Column({ nullable: true })
  plan: string;

  @Column({ nullable: true })
  planCode: string;

  @Column({ nullable: true })
  group: string;

  @Column({ nullable: true })
  groupName: string;

  @Column({ default: false })
  capitalRequired: boolean;

  @Column({ default: false })
  incomeRequired: boolean;

  @OneToMany(() => PayrollDetail, (detail: PayrollDetail) => detail.payroll)
  details: PayrollDetail[];

  @Column({ length: 20, nullable: false })
  status: string;

  @Column({ default: 0 })
  invalidRows: number;
}
