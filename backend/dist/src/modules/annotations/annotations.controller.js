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
exports.AnnotationsController = void 0;
const common_1 = require("@nestjs/common");
const annotations_service_1 = require("./annotations.service");
const create_annotation_dto_1 = require("./dto/create-annotation.dto");
const update_annotation_dto_1 = require("./dto/update-annotation.dto");
let AnnotationsController = class AnnotationsController {
    constructor(annotationsService) {
        this.annotationsService = annotationsService;
    }
    async findByMachine(machineId) {
        return this.annotationsService.findByMachine(machineId);
    }
    async create(createDto) {
        return this.annotationsService.create(createDto);
    }
    async update(id, updateDto) {
        return this.annotationsService.update(id, updateDto);
    }
    async remove(id) {
        return this.annotationsService.remove(id);
    }
};
exports.AnnotationsController = AnnotationsController;
__decorate([
    (0, common_1.Get)('machine/:machineId'),
    __param(0, (0, common_1.Param)('machineId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnnotationsController.prototype, "findByMachine", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_annotation_dto_1.CreateAnnotationDto]),
    __metadata("design:returntype", Promise)
], AnnotationsController.prototype, "create", null);
__decorate([
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_annotation_dto_1.UpdateAnnotationDto]),
    __metadata("design:returntype", Promise)
], AnnotationsController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AnnotationsController.prototype, "remove", null);
exports.AnnotationsController = AnnotationsController = __decorate([
    (0, common_1.Controller)('annotations'),
    __metadata("design:paramtypes", [annotations_service_1.AnnotationsService])
], AnnotationsController);
//# sourceMappingURL=annotations.controller.js.map