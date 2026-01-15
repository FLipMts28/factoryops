import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';
export declare class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private chatService;
    server: Server;
    constructor(chatService: ChatService);
    handleConnection(client: Socket): void;
    handleDisconnect(client: Socket): void;
    handleJoinChat(client: Socket, data: {
        machineId: string;
        userId: string;
    }): Promise<void>;
    handleLeaveChat(client: Socket, machineId: string): void;
    handleSendMessage(data: any): Promise<{
        user: {
            id: string;
            name: string;
            createdAt: Date;
            username: string;
            password: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        createdAt: Date;
        content: string;
        machineId: string;
        userId: string;
    }>;
    handleUserTyping(data: {
        machineId: string;
        userName: string;
    }): void;
}
