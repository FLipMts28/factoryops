import { Module } from '@nestjs/common';
import { ProductionLinesController } from './production-lines.controller';
import { ProductionLinesService } from './production-lines.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  controllers: [ProductionLinesController],
  providers: [ProductionLinesService, PrismaService],
})
export class ProductionLinesModule {}