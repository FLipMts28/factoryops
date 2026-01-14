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
exports.MachinesGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const machines_service_1 = require("./machines.service");
let MachinesGateway = class MachinesGateway {
    constructor(machinesService) {
        this.machinesService = machinesService;
    }
    afterInit() {
        console.log('🔌 Machines WebSocket initialized');
        this.startSimulation();
    }
    handleConnection(client) {
        console.log(`✅ Client connected: ${client.id}`);
    }
    handleDisconnect(client) {
        console.log(`❌ Client disconnected: ${client.id}`);
    }
    startSimulation() {
        this.simulationInterval = setInterval(async () => {
            const machine = await this.machinesService.simulateStatusChanges();
            if (machine) {
                this.server.emit('machineStatusChanged', machine);
            }
        }, 10000);
    }
    broadcastMachineUpdate(machine) {
        this.server.emit('machineStatusChanged', machine);
    }
};
exports.MachinesGateway = MachinesGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], MachinesGateway.prototype, "server", void 0);
exports.MachinesGateway = MachinesGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: ['http://localhost:5173', 'http://localhost:3000'],
            credentials: true,
        },
        namespace: '/machines',
    }),
    __metadata("design:paramtypes", [machines_service_1.MachinesService])
], MachinesGateway);
//# sourceMappingURL=machines.gateway.js.map