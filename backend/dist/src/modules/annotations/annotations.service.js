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
exports.AnnotationsService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let AnnotationsService = class AnnotationsService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByMachine(machineId) {
        return this.prisma.annotation.findMany({
            where: { machineId },
            include: { user: true },
            orderBy: { createdAt: 'desc' },
        });
    }
    async create(data) {
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
    async update(id, data) {
        return this.prisma.annotation.update({
            where: { id },
            data: { content: data.content },
            include: { user: true },
        });
    }
    async remove(id) {
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
};
exports.AnnotationsService = AnnotationsService;
exports.AnnotationsService = AnnotationsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], AnnotationsService);
//# sourceMappingURL=annotations.service.js.map