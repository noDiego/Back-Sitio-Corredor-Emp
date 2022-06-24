import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from './user';

@Entity()
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 15 })
  rut: string;

  @Column({ length: 100, nullable: false })
  name: string;

  @Column({ length: 62, nullable: false })
  type: string;

  @Column('simple-array')
  policies: string[];

  @Column({ default: false })
  seeAll: boolean;

  @Column({ length: 10, default: 'ENABLED', nullable: false })
  status: string;

  @ManyToOne(() => User, (user: User) => user.clients, { onDelete: 'CASCADE' })
  user?: User;
}
