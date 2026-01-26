import { Module } from '@nestjs/common';
import { DowntimesController } from './downtimes.controller';
import { DowntimesService } from './downtimes.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  controllers: [DowntimesController],
  providers: [DowntimesService, PrismaService],
  exports: [DowntimesService],
})
export class DowntimesModule {}
