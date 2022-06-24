import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { IsEmail } from 'class-validator';
import { DenounceFile } from './denounceFile';
import { IDenounceApplicationDTO } from '../../../domain/interfaces/dto/v1/IDenounceApplication';
import rutjs from 'rut.js';

@Entity()
export class DenounceApplication {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, nullable: true })
  consignment: string;

  @Column({ nullable: true })
  applicationNumber: number;

  @Column({ nullable: true })
  policy: number;

  @Column({ nullable: true })
  renovation: number;

  @Column({ nullable: true })
  paymentId: number;

  @Column({ length: 20 })
  insuredRut: string;

  @Column({ length: 100 })
  insuredName: string;

  @Column({ length: 100 })
  insuredLastname: string;

  @IsEmail()
  @Column({ length: 62 })
  insuredEmail: string;

  @Column({ length: 50, nullable: true })
  denounceTypeCode: string;

  @Column({ length: 30, nullable: true })
  denounceType: string;

  @Column({ length: 20, nullable: true })
  beneficiaryRut: string;

  @Column({ length: 200, nullable: true })
  beneficiaryName: string;

  @Column({ length: 20 })
  userRut: string;

  @Column({ length: 100 })
  userName: string;

  @IsEmail()
  @Column({ length: 62 })
  userEmail: string;

  @Column({ nullable: true })
  plan: string;

  @Column({ nullable: true })
  planCode: string;

  @Column({ nullable: true })
  amount: number;

  @Column({ length: 300, nullable: true })
  comment: string;

  @Column()
  creationDate: Date;

  @Column({ length: 20, nullable: false })
  status: string;

  @Column({ length: 100, nullable: true })
  groupCode: string;

  @OneToMany(() => DenounceFile, (file: DenounceFile) => file.denounceApp)
  files: DenounceFile[];

  public addFromDTO(denounceInput: IDenounceApplicationDTO): void {
    this.id = denounceInput.id;
    this.consignment = denounceInput.consignment;
    this.applicationNumber = denounceInput.applicationNumber;
    this.policy = denounceInput.policy;
    this.renovation = denounceInput.renovation;
    this.insuredRut = denounceInput.insuredRut;
    this.insuredName = denounceInput.insuredName;
    this.insuredLastname = denounceInput.insuredLastname;
    this.insuredEmail = denounceInput.insuredEmail;
    this.denounceTypeCode = denounceInput.denounceTypeCode;
    this.denounceType = denounceInput.denounceType;
    this.beneficiaryRut = denounceInput.beneficiaryRut;
    this.beneficiaryName = denounceInput.beneficiaryName;
    this.userRut = rutjs.format(denounceInput.userRut);
    this.userName = denounceInput.userName;
    this.userEmail = denounceInput.userEmail;
    this.plan = denounceInput.plan;
    this.planCode = denounceInput.planCode;
    this.amount = denounceInput.amount;
    this.comment = denounceInput.comment;
    this.creationDate = denounceInput.creationDate;
    this.status = denounceInput.status;
    this.groupCode = denounceInput.groupCode;
    this.paymentId = denounceInput.paymentId;
  }
}
