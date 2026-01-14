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
exports.ChatService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../../prisma/prisma.service");
let ChatService = class ChatService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByMachine(machineId, limit = 50) {
        return this.prisma.chatMessage.findMany({
            where: { machineId },
            include: { user: true },
            orderBy: { createdAt: 'desc' },
            take: limit,
        });
    }
    async create(data) {
        const message = await this.prisma.chatMessage.create({
            data: {
                content: data.content,
                machineId: data.machineId,
                userId: data.userId,
            },
            include: { user: true },
        });
        await this.prisma.eventLog.create({
            data: {
                eventType: 'MESSAGE_SENT',
                description: `Message sent in machine chat`,
                machineId: data.machineId,
                userId: data.userId,
            },
        });
        return message;
    }
};
exports.ChatService = ChatService;
exports.ChatService = ChatService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], ChatService);
//# sourceMappingURL=chat.service.js.map