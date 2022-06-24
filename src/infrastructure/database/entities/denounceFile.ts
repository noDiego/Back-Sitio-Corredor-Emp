import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { DenounceApplication } from './denounceApplication';
import { IDenounceFileDTO } from '../../../domain/interfaces/dto/v1/IDenounceFile';

@Entity()
export class DenounceFile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 250 })
  blobName: string;

  @Column()
  name: string;

  @Column({ length: 10 })
  extension: string;

  @Column({ length: 50 })
  mimeType: string;

  @Column()
  creationDate: Date;

  @ManyToOne(() => DenounceApplication, (app: DenounceApplication) => app.files, {
    onDelete: 'CASCADE',
    nullable: false
  })
  denounceApp: DenounceApplication;

  @Column()
  denounceAppId: number;

  @Column({ length: 20, nullable: false })
  status: string;

  addFromDTO(denounceFileDTO: IDenounceFileDTO): void {
    this.blobName = denounceFileDTO.blobName;
    this.name = denounceFileDTO.name;
    this.extension = denounceFileDTO.extension;
    this.mimeType = denounceFileDTO.mimeType;
    this.creationDate = denounceFileDTO.creationDate;
    this.status = denounceFileDTO.status;
  }
}
