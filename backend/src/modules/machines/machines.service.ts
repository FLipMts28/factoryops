import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { MachineStatus } from '../../common/enums';
import { CreateMachineDto } from './dto/create-machine.dto';

@Injectable()
export class MachinesService {
  constructor(private prisma: PrismaService) {}

  /**
   * Create a new machine in the database
   * @param createMachineDto Machine data
   * @returns Created machine with production line
   */
  async create(createMachineDto: CreateMachineDto) {
    return this.prisma.machine.create({
      data: {
        name: createMachineDto.name,
        code: createMachineDto.code,
        status: createMachineDto.status,
        productionLineId: createMachineDto.productionLineId,
        schemaImageUrl: createMachineDto.schemaImageUrl,
      },
      include: {
        productionLine: true,
      },
    });
  }

  async findAll() {
    return this.prisma.machine.findMany({
      include: {
        productionLine: true,
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.machine.findUnique({
      where: { id },
      include: {
        productionLine: true,
        annotations: {
          include: { user: true },
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  async updateStatus(id: string, status: MachineStatus) {
    const machine = await this.prisma.machine.update({
      where: { id },
      data: { status },
      include: { productionLine: true },
    });

    await this.prisma.eventLog.create({
      data: {
        eventType: 'MACHINE_STATUS_CHANGE',
        description: `Machine ${machine.name} status changed to ${status}`,
        machineId: id,
        metadata: { oldStatus: machine.status, newStatus: status },
      },
    });

    return machine;
  }

  async simulateStatusChanges() {
    const machines = await this.findAll();
    const statuses: MachineStatus[] = [MachineStatus.NORMAL, MachineStatus.WARNING, MachineStatus.FAILURE, MachineStatus.MAINTENANCE];
    
    const randomMachine = machines[Math.floor(Math.random() * machines.length)];
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
    
    if (randomMachine) {
      return this.updateStatus(randomMachine.id, randomStatus);
    }
  }
}