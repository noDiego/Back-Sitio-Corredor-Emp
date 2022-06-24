import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Functionality {
  @PrimaryGeneratedColumn()
  code: number;

  @Column({ length: 250 })
  description: string;

  @Column({ length: 10, default: 'ENABLED', nullable: false })
  status: string;
}
