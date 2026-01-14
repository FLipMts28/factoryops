import { OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MachinesService } from './machines.service';
export declare class MachinesGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    private machinesService;
    server: Server;
    private simulationInterval;
    constructor(machinesService: MachinesService);
    afterInit(): void;
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    private startSimulation;
    broadcastMachineUpdate(machine: any): void;
}
