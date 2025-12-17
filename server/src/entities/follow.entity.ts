import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity()
@Index(['followerId', 'followeeId'], { unique: true })
export class Follow {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  followerId!: number;

  @Column()
  followeeId!: number;
}
