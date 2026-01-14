import { Module } from '@nestjs/common';
import { MachinesController } from './machines.controller';
import { MachinesService } from './machines.service';
import { MachinesGateway } from './machines.gateway';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  controllers: [MachinesController],
  providers: [MachinesService, MachinesGateway, PrismaService],
  exports: [MachinesService],
})
export class MachinesModule {}