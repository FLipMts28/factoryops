import { ChatService } from './chat.service';
export declare class ChatController {
    private readonly chatService;
    constructor(chatService: ChatService);
    getMessagesByMachine(machineId: string): Promise<({
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
    })[]>;
}
