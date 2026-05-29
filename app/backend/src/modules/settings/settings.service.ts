import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Settings } from './settings.entity';

@Injectable()
export class SettingsService {
  constructor(
    @InjectRepository(Settings)
    private readonly repo: Repository<Settings>,
  ) {}

  async get(): Promise<Settings> {
    let s = await this.repo.findOne({ where: { id: 'global' } });
    if (!s) s = await this.repo.save(this.repo.create({ id: 'global' }));
    return s;
  }

  async update(patch: Partial<Settings>): Promise<Settings> {
    const s = await this.get();
    Object.assign(s, patch, { id: 'global' });
    return this.repo.save(s);
  }
}
