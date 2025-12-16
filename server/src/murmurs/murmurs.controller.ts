import { Body, Controller, Delete, Get, Param, Post, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { MurmursService } from './murmurs.service';
import { getMeId } from '../common/me';

@Controller('/api/murmurs')
export class MurmursController {
  constructor(private readonly service: MurmursService) {}

  @Get()
  async timeline(@Req() req: Request, @Query('page') page?: string) {
    const meId = getMeId(req);
    return this.service.timeline(meId, Number(page ?? 1));
  }

  @Get(':id')
  async detail(@Req() req: Request, @Param('id') id: string) {
    const meId = getMeId(req);
    return this.service.getById(meId, Number(id));
  }

  @Post()
  async create(@Req() req: Request, @Body() body: { text: string }) {
    const meId = getMeId(req);
    return this.service.create(meId, body.text);
  }

  @Delete(':id')
  async remove(@Req() req: Request, @Param('id') id: string) {
    const meId = getMeId(req);
    return this.service.remove(meId, Number(id));
  }

  @Post(':id/like')
  async like(@Req() req: Request, @Param('id') id: string) {
    const meId = getMeId(req);
    return this.service.like(meId, Number(id));
  }

  @Delete(':id/like')
  async unlike(@Req() req: Request, @Param('id') id: string) {
    const meId = getMeId(req);
    return this.service.unlike(meId, Number(id));
  }
}
