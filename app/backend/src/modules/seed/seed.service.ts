import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Zone } from '../zones/zone.entity';
import { Container } from '../containers/container.entity';
import { UsersService } from '../users/users.service';
import { GamificationService } from '../gamification/gamification.service';
import { Role } from '../../common/enums/role.enum';
import { ContainerStatus } from '../../common/enums/domain.enums';

const LYON = { lat: 45.764, lng: 4.8357 };
const CONTAINERS_PER_ZONE = 12;

const DEMO_USERS = [
  { email: 'admin@ecotrack.fr', role: Role.ADMIN, firstName: 'Alice', lastName: 'Admin' },
  { email: 'gestionnaire@ecotrack.fr', role: Role.GESTIONNAIRE, firstName: 'Gilles', lastName: 'Gestion' },
  { email: 'agent@ecotrack.fr', role: Role.AGENT, firstName: 'Adam', lastName: 'Agent' },
  { email: 'citoyen@ecotrack.fr', role: Role.CITOYEN, firstName: 'Chloé', lastName: 'Citoyen' },
];
const DEMO_PASSWORD = 'Password123';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(Zone) private readonly zones: Repository<Zone>,
    @InjectRepository(Container) private readonly containers: Repository<Container>,
    private readonly users: UsersService,
    private readonly gamification: GamificationService,
  ) {}

  async onApplicationBootstrap() {
    // Le catalogue de badges est garanti à chaque démarrage.
    await this.gamification.ensureCatalog();
    const existing = await this.containers.count();
    if (existing > 0) {
      this.logger.log(`Seed ignoré (${existing} conteneurs déjà présents).`);
      return;
    }
    await this.seed();
  }

  async seed() {
    this.logger.log('Initialisation des données de démonstration (Lyon)…');

    // 12 secteurs répartis en grille autour de Lyon
    const zones: Zone[] = [];
    for (let i = 0; i < 12; i++) {
      const row = Math.floor(i / 4);
      const col = i % 4;
      const z = await this.zones.save(
        this.zones.create({
          code: `SECTEUR-${String(i + 1).padStart(2, '0')}`,
          name: `Secteur ${i + 1}`,
          centerLat: LYON.lat + (row - 1) * 0.025,
          centerLng: LYON.lng + (col - 1.5) * 0.03,
        }),
      );
      zones.push(z);
    }

    // Conteneurs autour de chaque centre de secteur
    let n = 0;
    for (const z of zones) {
      for (let j = 0; j < CONTAINERS_PER_ZONE; j++) {
        n++;
        const lat = (z.centerLat ?? LYON.lat) + (Math.random() - 0.5) * 0.02;
        const lng = (z.centerLng ?? LYON.lng) + (Math.random() - 0.5) * 0.02;
        const fill = Math.floor(Math.random() * 100);
        await this.containers.save(
          this.containers.create({
            code: `CT-${String(n).padStart(4, '0')}`,
            address: `${z.name}, Lyon`,
            capacityLiters: [660, 1000, 1100][n % 3],
            location: { type: 'Point', coordinates: [lng, lat] },
            zoneId: z.id,
            currentFillLevel: fill,
            status:
              fill >= 90
                ? ContainerStatus.CRITICAL
                : fill >= 70
                  ? ContainerStatus.WARNING
                  : ContainerStatus.OK,
            lastMeasurementAt: new Date(),
          }),
        );
      }
    }

    // Comptes de démonstration (4 rôles)
    for (const u of DEMO_USERS) {
      try {
        await this.users.create({ ...u, password: DEMO_PASSWORD });
      } catch {
        /* déjà créé */
      }
    }

    this.logger.log(
      `Seed terminé : ${zones.length} secteurs, ${n} conteneurs, ${DEMO_USERS.length} comptes démo (mdp: ${DEMO_PASSWORD}).`,
    );
  }
}
