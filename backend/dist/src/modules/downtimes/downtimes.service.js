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
exports.DowntimesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let DowntimesService = class DowntimesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByMachine(machineId) {
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
    async create(dto) {
        console.log('📥 DTO recebido no service:', JSON.stringify(dto, null, 2));
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
        let duration;
        if (dto.endTime) {
            const start = new Date(dto.startTime);
            const end = new Date(dto.endTime);
            if (isNaN(start.getTime())) {
                throw new Error('startTime inválido');
            }
            if (isNaN(end.getTime())) {
                throw new Error('endTime inválido');
            }
            duration = Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
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
};
exports.DowntimesService = DowntimesService;
exports.DowntimesService = DowntimesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DowntimesService);
//# sourceMappingURL=downtimes.service.js.map