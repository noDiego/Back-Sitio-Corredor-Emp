import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, JoinTable } from 'typeorm';
import { Payroll } from './payroll';

@Entity()
export class PayrollDetail {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  rowNumber: number;

  @Column({ nullable: false })
  payrollId: number;

  @ManyToOne(() => Payroll, (payroll: Payroll) => payroll.details, {
    eager: true,
    onDelete: 'CASCADE',
    nullable: false
  })
  @JoinTable({ name: 'details' })
  payroll: Payroll;

  @Column()
  creationDate: Date;

  @Column()
  insuredRut: number;

  @Column({ length: 1 })
  insuredDV: string;

  @Column({ nullable: true })
  dependentRut: number;

  @Column({ length: 1, nullable: true })
  dependentDV: string;

  @Column({ length: 100, nullable: true })
  name: string;

  @Column({ length: 100, nullable: true })
  lastName: string;

  @Column({ nullable: true })
  birthday: Date;

  @Column({ length: 50, nullable: true })
  gender: string;

  @Column({ nullable: true })
  contractDate: Date;

  @Column({ nullable: true })
  initDate: Date;

  @Column({ nullable: true })
  endDate: Date;

  @Column({ nullable: true, type: 'bigint' })
  income: bigint;

  @Column({ nullable: true, type: 'bigint' })
  capital: bigint;

  @Column({ length: 62, nullable: true })
  email: string;

  @Column({ length: 2, nullable: true })
  bank: string;

  @Column({ length: 50, nullable: true })
  bankName: string;

  @Column({ nullable: true })
  bankAccountNumber: number;

  @Column({ length: 25, nullable: true })
  kinship: string;

  @Column({ length: 12, nullable: true })
  phone: string;

  @Column({ length: 75, nullable: true })
  isapre: string;

  @Column({ length: 20 })
  status: string;

  @Column({ nullable: true })
  invalidDetail: string;
}
