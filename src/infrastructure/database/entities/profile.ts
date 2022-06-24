import { Column, Entity, JoinTable, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Functionality } from './functionality';

@Entity()
export class Profile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 250 })
  description: string;

  @ManyToMany(() => Functionality)
  @JoinTable()
  functionalities: Functionality[];

  @Column({ length: 10, default: 'ENABLED', nullable: false })
  status: string;
}
