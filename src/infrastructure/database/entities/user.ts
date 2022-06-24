import { Column, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Client } from './client';
import { IsEmail } from 'class-validator';
import { Profile } from './profile';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 15 })
  rut: string;

  @Column({ length: 50, nullable: true })
  type: string;

  @OneToMany(() => Client, (client: Client) => client.user)
  clients: Client[];

  @Column({ length: 100, nullable: false })
  name: string;

  @IsEmail()
  @Column({ length: 62, nullable: false })
  email: string;

  @ManyToMany(() => Profile)
  @JoinTable()
  profiles: Profile[];

  @Column({ length: 10, default: 'ENABLED', nullable: false })
  status: string;
}
