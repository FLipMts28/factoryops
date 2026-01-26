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
exports.DowntimesController = void 0;
const common_1 = require("@nestjs/common");
const downtimes_service_1 = require("./downtimes.service");
const create_downtime_dto_1 = require("./dto/create-downtime.dto");
let DowntimesController = class DowntimesController {
    constructor(downtimesService) {
        this.downtimesService = downtimesService;
    }
    async findByMachine(machineId) {
        return this.downtimesService.findByMachine(machineId);
    }
    async create(dto) {
        console.log('📨 POST /downtimes - Body recebido:', JSON.stringify(dto, null, 2));
        return this.downtimesService.create(dto);
    }
    async findAll() {
        return this.downtimesService.findAll();
    }
    async closeDowntime(id, body) {
        console.log(`🔒 PATCH /downtimes/${id}/close - Fechando paragem`);
        return this.downtimesService.closeDowntime(id, body.endTime);
    }
};
exports.DowntimesController = DowntimesController;
__decorate([
    (0, common_1.Get)('machine/:machineId'),
    __param(0, (0, common_1.Param)('machineId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], DowntimesController.prototype, "findByMachine", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_downtime_dto_1.CreateDowntimeDto]),
    __metadata("design:returntype", Promise)
], DowntimesController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], DowntimesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Patch)(':id/close'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], DowntimesController.prototype, "closeDowntime", null);
exports.DowntimesController = DowntimesController = __decorate([
    (0, common_1.Controller)('downtimes'),
    __metadata("design:paramtypes", [downtimes_service_1.DowntimesService])
], DowntimesController);
//# sourceMappingURL=downtimes.controller.js.map