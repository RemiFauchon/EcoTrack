import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Zone } from './zone.entity';

@Injectable()
export class ZonesService {
  constructor(
    @InjectRepository(Zone)
    private readonly repo: Repository<Zone>,
  ) {}

  findAll(): Promise<Zone[]> {
    return this.repo.find({ order: { code: 'ASC' } });
  }

  findOne(id: string): Promise<Zone | null> {
    return this.repo.findOne({ where: { id } });
  }
}
