import { Server, Socket } from 'socket.io';
import { AnnotationsService } from './annotations.service';
export declare class AnnotationsGateway {
    private annotationsService;
    server: Server;
    constructor(annotationsService: AnnotationsService);
    handleJoinMachine(client: Socket, machineId: string): void;
    handleLeaveMachine(client: Socket, machineId: string): void;
    handleCreateAnnotation(data: any): Promise<{
        user: {
            id: string;
            name: string;
            createdAt: Date;
            username: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.AnnotationType;
        content: import("@prisma/client/runtime/library").JsonValue;
        machineId: string;
        userId: string;
    }>;
    handleUpdateAnnotation(data: any): Promise<{
        user: {
            id: string;
            name: string;
            createdAt: Date;
            username: string;
            role: import(".prisma/client").$Enums.UserRole;
        };
    } & {
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.AnnotationType;
        content: import("@prisma/client/runtime/library").JsonValue;
        machineId: string;
        userId: string;
    }>;
    handleDeleteAnnotation(data: any): Promise<void>;
}
