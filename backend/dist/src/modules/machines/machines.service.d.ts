import { PrismaService } from '../../../prisma/prisma.service';
import { MachineStatus } from '../../common/enums';
export declare class MachinesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        productionLine: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            isActive: boolean;
        };
    } & {
        id: string;
        name: string;
        code: string;
        status: import(".prisma/client").$Enums.MachineStatus;
        schemaImageUrl: string | null;
        productionLineId: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string): Promise<{
        productionLine: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            isActive: boolean;
        };
        annotations: ({
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
        })[];
    } & {
        id: string;
        name: string;
        code: string;
        status: import(".prisma/client").$Enums.MachineStatus;
        schemaImageUrl: string | null;
        productionLineId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateStatus(id: string, status: MachineStatus): Promise<{
        productionLine: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            isActive: boolean;
        };
    } & {
        id: string;
        name: string;
        code: string;
        status: import(".prisma/client").$Enums.MachineStatus;
        schemaImageUrl: string | null;
        productionLineId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    simulateStatusChanges(): Promise<{
        productionLine: {
            id: string;
            name: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            isActive: boolean;
        };
    } & {
        id: string;
        name: string;
        code: string;
        status: import(".prisma/client").$Enums.MachineStatus;
        schemaImageUrl: string | null;
        productionLineId: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
