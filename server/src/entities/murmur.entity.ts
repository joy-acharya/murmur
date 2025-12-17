import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity()
export class Murmur {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ type: 'text' })
  text!: string;

  @Index()
  @Column()
  userId!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
