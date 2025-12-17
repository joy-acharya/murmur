import { Entity, PrimaryGeneratedColumn, Column, Index, CreateDateColumn } from 'typeorm';

@Entity()
@Index(['userId', 'murmurId'], { unique: true })
export class Like {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  userId!: number;

  @Column()
  murmurId!: number;

  @CreateDateColumn()
  createdAt!: Date;
}
