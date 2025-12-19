import { Controller, Delete, Get, Param, Post, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './users.service';
import { getMeId } from '../common/me';

@Controller('/api/users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Get(':id')
  async profile(@Req() req: Request, @Param('id') id: string) {
    const meId = getMeId(req);
    return this.service.getProfile(meId, Number(id));
  }

  @Get(':id/murmurs')
  async userMurmurs(@Param('id') id: string, @Query('page') page?: string) {
    return this.service.listUserMurmurs(Number(id), Number(page ?? 1));
  }

  @Post(':id/follow')
  async follow(@Req() req: Request, @Param('id') id: string) {
    const meId = getMeId(req);
    return this.service.follow(meId, Number(id));
  }

  @Delete(':id/follow')
  async unfollow(@Req() req: Request, @Param('id') id: string) {
    const meId = getMeId(req);
    return this.service.unfollow(meId, Number(id));
  }
}
