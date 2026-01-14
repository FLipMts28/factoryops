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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AnnotationsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const annotations_service_1 = require("./annotations.service");
let AnnotationsGateway = class AnnotationsGateway {
    constructor(annotationsService) {
        this.annotationsService = annotationsService;
    }
    handleJoinMachine(client, machineId) {
        client.join(`machine:${machineId}`);
        console.log(`Client ${client.id} joined machine:${machineId}`);
    }
    handleLeaveMachine(client, machineId) {
        client.leave(`machine:${machineId}`);
    }
    async handleCreateAnnotation(data) {
        const annotation = await this.annotationsService.create(data);
        this.server.to(`machine:${data.machineId}`).emit('annotationCreated', annotation);
        return annotation;
    }
    async handleUpdateAnnotation(data) {
        const annotation = await this.annotationsService.update(data.id, data);
        this.server.to(`machine:${data.machineId}`).emit('annotationUpdated', annotation);
        return annotation;
    }
    async handleDeleteAnnotation(data) {
        await this.annotationsService.remove(data.id);
        this.server.to(`machine:${data.machineId}`).emit('annotationDeleted', data.id);
    }
};
exports.AnnotationsGateway = AnnotationsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], AnnotationsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_1.SubscribeMessage)('joinMachine'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], AnnotationsGateway.prototype, "handleJoinMachine", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('leaveMachine'),
    __param(0, (0, websockets_1.ConnectedSocket)()),
    __param(1, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket, String]),
    __metadata("design:returntype", void 0)
], AnnotationsGateway.prototype, "handleLeaveMachine", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('createAnnotation'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnnotationsGateway.prototype, "handleCreateAnnotation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('updateAnnotation'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnnotationsGateway.prototype, "handleUpdateAnnotation", null);
__decorate([
    (0, websockets_1.SubscribeMessage)('deleteAnnotation'),
    __param(0, (0, websockets_1.MessageBody)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AnnotationsGateway.prototype, "handleDeleteAnnotation", null);
exports.AnnotationsGateway = AnnotationsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: ['http://localhost:5173', 'http://localhost:3000'],
            credentials: true,
        },
        namespace: '/annotations',
    }),
    __metadata("design:paramtypes", [annotations_service_1.AnnotationsService])
], AnnotationsGateway);
//# sourceMappingURL=annotations.gateway.js.map