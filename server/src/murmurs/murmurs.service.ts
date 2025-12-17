import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Murmur } from '../entities/murmur.entity';
import { Follow } from '../entities/follow.entity';
import { Like } from '../entities/like.entity';

@Injectable()
export class MurmursService {
  constructor(
    @InjectRepository(Murmur) private readonly murmursRepo: Repository<Murmur>,
    @InjectRepository(Follow) private readonly followsRepo: Repository<Follow>,
    @InjectRepository(Like) private readonly likesRepo: Repository<Like>,
  ) {}

  async timeline(meId: number, page = 1, pageSize = 10) {
    const follows = await this.followsRepo.find({ where: { followerId: meId } });
    const ids = [meId, ...follows.map(f => f.followeeId)];
    const skip = (page - 1) * pageSize;

    const [items, total] = await this.murmursRepo.findAndCount({
      where: { userId: In(ids) },
      order: { createdAt: 'DESC' },
      take: pageSize,
      skip,
    });

    // attach likeCount + isLikedByMe
    const murmurIds = items.map(m => m.id);
    let likeCounts: Record<number, number> = {};
    let likedByMe = new Set<number>();

    if (murmurIds.length) {
      const rows = await this.likesRepo
        .createQueryBuilder('l')
        .select('l.murmurId', 'murmurId')
        .addSelect('COUNT(*)', 'cnt')
        .where('l.murmurId IN (:...ids)', { ids: murmurIds })
        .groupBy('l.murmurId')
        .getRawMany();

      rows.forEach(r => (likeCounts[Number(r.murmurId)] = Number(r.cnt)));

      const myLikes = await this.likesRepo.find({
        where: { userId: meId, murmurId: In(murmurIds) },
      });
      myLikes.forEach(l => likedByMe.add(l.murmurId));
    }

    return {
      page,
      pageSize,
      total,
      items: items.map(m => ({
        ...m,
        likeCount: likeCounts[m.id] ?? 0,
        isLikedByMe: likedByMe.has(m.id),
      })),
    };
  }

  async getById(meId: number, id: number) {
    const murmur = await this.murmursRepo.findOne({ where: { id } });
    if (!murmur) throw new NotFoundException('Murmur not found');

    const likeCount = await this.likesRepo.count({ where: { murmurId: id } });
    const isLikedByMe = (await this.likesRepo.count({ where: { murmurId: id, userId: meId } })) > 0;

    return { ...murmur, likeCount, isLikedByMe };
  }

  async create(meId: number, text: string) {
    const m = this.murmursRepo.create({ userId: meId, text });
    return this.murmursRepo.save(m);
  }

  async remove(meId: number, id: number) {
    const murmur = await this.murmursRepo.findOne({ where: { id } });
    if (!murmur) throw new NotFoundException('Murmur not found');
    if (murmur.userId !== meId) throw new ForbiddenException('Not your murmur');

    await this.likesRepo.delete({ murmurId: id });
    await this.murmursRepo.delete({ id });
    return { success: true };
  }

  async like(meId: number, murmurId: number) {
    const exists = await this.murmursRepo.exist({ where: { id: murmurId } });
    if (!exists) throw new NotFoundException('Murmur not found');

    // idempotent
    const already = await this.likesRepo.findOne({ where: { userId: meId, murmurId } });
    if (already) return { success: true };

    await this.likesRepo.save(this.likesRepo.create({ userId: meId, murmurId }));
    return { success: true };
  }

  async unlike(meId: number, murmurId: number) {
    await this.likesRepo.delete({ userId: meId, murmurId });
    return { success: true };
  }
}
