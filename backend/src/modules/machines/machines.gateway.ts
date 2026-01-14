import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { MachinesService } from './machines.service';

@WebSocketGateway({
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  },
  namespace: '/machines',
})
export class MachinesGateway implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private simulationInterval: NodeJS.Timeout;

  constructor(private machinesService: MachinesService) {}

  afterInit() {
    console.log('🔌 Machines WebSocket initialized');
    this.startSimulation();
  }

  handleConnection(client: Socket) {
    console.log(`✅ Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`❌ Client disconnected: ${client.id}`);
  }

  private startSimulation() {
    this.simulationInterval = setInterval(async () => {
      const machine = await this.machinesService.simulateStatusChanges();
      if (machine) {
        this.server.emit('machineStatusChanged', machine);
      }
    }, 10000); // Change status every 10 seconds
  }

  broadcastMachineUpdate(machine: any) {
    this.server.emit('machineStatusChanged', machine);
  }
}
