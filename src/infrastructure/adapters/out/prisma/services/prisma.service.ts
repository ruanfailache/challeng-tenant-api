import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { PrismaClient } from '../generated/client';

@Injectable()
export class PrismaService extends PrismaClient {
    constructor(configService: ConfigService) {
        super({
            adapter: new PrismaPg(
                new Pool({
                    connectionString: configService.get('DATABASE_URL')
                })
            )
        });
    }
}
