"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MachinesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
const enums_1 = require("../../common/enums");
let MachinesService = class MachinesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(createMachineDto) {
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
    async findOne(id) {
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
    async updateStatus(id, status) {
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
        const statuses = [enums_1.MachineStatus.NORMAL, enums_1.MachineStatus.WARNING, enums_1.MachineStatus.FAILURE, enums_1.MachineStatus.MAINTENANCE];
        const randomMachine = machines[Math.floor(Math.random() * machines.length)];
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        if (randomMachine) {
            return this.updateStatus(randomMachine.id, randomStatus);
        }
    }
    async remove(id) {
        const machine = await this.findOne(id);
        if (!machine) {
            throw new Error('Máquina não encontrada');
        }
        await this.prisma.machine.delete({
            where: { id },
        });
        await this.prisma.eventLog.create({
            data: {
                eventType: 'MACHINE_STATUS_CHANGE',
                description: `Machine ${machine.name} (${machine.code}) was deleted`,
                metadata: {
                    action: 'DELETE',
                    machineName: machine.name,
                    machineCode: machine.code,
                    deletedMachineId: id,
                },
            },
        });
        return { success: true, message: 'Máquina deletada com sucesso' };
    }
};
exports.MachinesService = MachinesService;
exports.MachinesService = MachinesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], MachinesService);
//# sourceMappingURL=machines.service.js.map