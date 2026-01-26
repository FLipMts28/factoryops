import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateDowntimeDto } from './dto/create-downtime.dto';

@Injectable()
export class DowntimesService {
  constructor(private prisma: PrismaService) {}

  async findByMachine(machineId: string) {
    return this.prisma.downtime.findMany({
      where: { machineId },
      orderBy: { startTime: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async create(dto: CreateDowntimeDto) {
    // LOG: Ver o que está chegando
    console.log('📥 DTO recebido no service:', JSON.stringify(dto, null, 2));

    // Validar campos obrigatórios
    if (!dto.machineId) {
      throw new Error('machineId é obrigatório');
    }
    if (!dto.reason) {
      throw new Error('reason é obrigatório');
    }
    if (!dto.startTime) {
      throw new Error('startTime é obrigatório');
    }
    if (!dto.userId) {
      throw new Error('userId é obrigatório');
    }

    // Calcular duração se endTime fornecido
    let duration: number | undefined;
    if (dto.endTime) {
      const start = new Date(dto.startTime);
      const end = new Date(dto.endTime);
      
      // Validar datas
      if (isNaN(start.getTime())) {
        throw new Error('startTime inválido');
      }
      if (isNaN(end.getTime())) {
        throw new Error('endTime inválido');
      }
      
      duration = Math.floor((end.getTime() - start.getTime()) / (1000 * 60)); // minutos
    }

    const data = {
      machineId: dto.machineId,
      reason: dto.reason,
      startTime: new Date(dto.startTime),
      endTime: dto.endTime ? new Date(dto.endTime) : undefined,
      duration,
      notes: dto.notes,
      userId: dto.userId,
    };

    console.log('💾 Dados para salvar:', JSON.stringify(data, null, 2));

    return this.prisma.downtime.create({
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findAll() {
    return this.prisma.downtime.findMany({
      orderBy: { startTime: 'desc' },
      include: {
        machine: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }
}