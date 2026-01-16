import { PrismaService } from '../../../prisma/prisma.service';
import { MachineStatus } from '../../common/enums';
import { CreateMachineDto } from './dto/create-machine.dto';
export declare class MachinesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createMachineDto: CreateMachineDto): Promise<{
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
        createdAt: Date;
        updatedAt: Date;
        productionLineId: string;
    }>;
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
        createdAt: Date;
        updatedAt: Date;
        productionLineId: string;
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
                password: string;
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
        createdAt: Date;
        updatedAt: Date;
        productionLineId: string;
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
        createdAt: Date;
        updatedAt: Date;
        productionLineId: string;
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
        createdAt: Date;
        updatedAt: Date;
        productionLineId: string;
    }>;
    remove(id: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
