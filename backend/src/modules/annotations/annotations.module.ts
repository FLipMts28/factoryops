import { Module } from '@nestjs/common';
import { AnnotationsController } from './annotations.controller';
import { AnnotationsService } from './annotations.service';
import { AnnotationsGateway } from './annotations.gateway';
import { PrismaService } from '../../../prisma/prisma.service';

@Module({
  controllers: [AnnotationsController],
  providers: [AnnotationsService, AnnotationsGateway, PrismaService],
})
export class AnnotationsModule {}