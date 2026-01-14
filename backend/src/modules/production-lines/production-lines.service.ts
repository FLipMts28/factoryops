import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ProductionLinesService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.productionLine.findMany({
      include: {
        machines: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.productionLine.findUnique({
      where: { id },
      include: {
        machines: {
          include: {
            annotations: true,
          },
        },
      },
    });
  }
}