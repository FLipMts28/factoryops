import { PrismaService } from '../../../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';
export declare class ChatService {
    private prisma;
    constructor(prisma: PrismaService);
    findByMachine(machineId: string, limit?: number): Promise<({
        user: {
            name: string;
            id: string;
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
    create(data: CreateMessageDto): Promise<{
        user: {
            name: string;
            id: string;
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
}
