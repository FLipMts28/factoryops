import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateAnnotationDto } from './dto/create-annotation.dto';
import { UpdateAnnotationDto } from './dto/update-annotation.dto';

@Injectable()
export class AnnotationsService {
  constructor(private prisma: PrismaService) {}

  async findByMachine(machineId: string) {
    return this.prisma.annotation.findMany({
      where: { machineId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: CreateAnnotationDto) {
    const annotation = await this.prisma.annotation.create({
      data: {
        type: data.type,
        content: data.content,
        machineId: data.machineId,
        userId: data.userId,
      },
      include: { user: true },
    });

    await this.prisma.eventLog.create({
      data: {
        eventType: 'ANNOTATION_CREATED',
        description: `Annotation created on machine`,
        machineId: data.machineId,
        userId: data.userId,
      },
    });

    return annotation;
  }

  async update(id: string, data: UpdateAnnotationDto) {
    return this.prisma.annotation.update({
      where: { id },
      data: { content: data.content },
      include: { user: true },
    });
  }

  async remove(id: string) {
    const annotation = await this.prisma.annotation.findUnique({
      where: { id },
    });

    await this.prisma.eventLog.create({
      data: {
        eventType: 'ANNOTATION_DELETED',
        description: `Annotation deleted`,
        machineId: annotation.machineId,
        userId: annotation.userId,
      },
    });

    return this.prisma.annotation.delete({
      where: { id },
    });
  }
}
