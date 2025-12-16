import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Murmur } from '../entities/murmur.entity';
import { Follow } from '../entities/follow.entity';
import { Like } from '../entities/like.entity';
import { MurmursService } from './murmurs.service';
import { MurmursController } from './murmurs.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Murmur, Follow, Like])],
  providers: [MurmursService],
  controllers: [MurmursController],
})
export class MurmursModule {}
