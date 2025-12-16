import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { Murmur } from '../entities/murmur.entity';
import { Follow } from '../entities/follow.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly usersRepo: Repository<User>,
    @InjectRepository(Murmur) private readonly murmursRepo: Repository<Murmur>,
    @InjectRepository(Follow) private readonly followsRepo: Repository<Follow>,
  ) {}

  async getProfile(meId: number, userId: number) {
    const user = await this.usersRepo.findOne({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    const followingCount = await this.followsRepo.count({ where: { followerId: userId } });
    const followerCount = await this.followsRepo.count({ where: { followeeId: userId } });

    const isFollowedByMe =
      meId !== userId &&
      (await this.followsRepo.count({
        where: { followerId: meId, followeeId: userId },
      })) > 0;

    return {
      id: user.id,
      name: (user as any).name ?? `User ${user.id}`,
      email: (user as any).email,
      followingCount,
      followerCount,
      isFollowedByMe,
    };
  }

  async listUserMurmurs(userId: number, page = 1, pageSize = 10) {
    const exists = await this.usersRepo.exist({ where: { id: userId } });
    if (!exists) throw new NotFoundException('User not found');

    const skip = (page - 1) * pageSize;
    const [items, total] = await this.murmursRepo.findAndCount({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: pageSize,
      skip,
    });

    return { page, pageSize, total, items };
  }

  async follow(meId: number, targetUserId: number) {
    if (meId === targetUserId) {
      throw new BadRequestException('Cannot follow yourself');
    }

    const exists = await this.usersRepo.exist({ where: { id: targetUserId } });
    if (!exists) throw new NotFoundException('User not found');

    const already = await this.followsRepo.findOne({
      where: { followerId: meId, followeeId: targetUserId },
    });
    if (already) return { success: true };

    await this.followsRepo.save(
      this.followsRepo.create({
        followerId: meId,
        followeeId: targetUserId,
      }),
    );

    return { success: true };
  }

  async unfollow(meId: number, targetUserId: number) {
    await this.followsRepo.delete({
      followerId: meId,
      followeeId: targetUserId,
    });
    return { success: true };
  }
}
