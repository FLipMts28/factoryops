import { PrismaService } from '../../../prisma/prisma.service';
import { MachineStatus } from '../../common/enums';
import { CreateMachineDto } from './dto/create-machine.dto';
export declare class MachinesService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createMachineDto: CreateMachineDto): Promise<{
        productionLine: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            isActive: boolean;
        };
    } & {
        name: string;
        code: string;
        status: import(".prisma/client").$Enums.MachineStatus;
        productionLineId: string;
        schemaImageUrl: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    findAll(): Promise<({
        productionLine: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            isActive: boolean;
        };
    } & {
        name: string;
        code: string;
        status: import(".prisma/client").$Enums.MachineStatus;
        productionLineId: string;
        schemaImageUrl: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    })[]>;
    findOne(id: string): Promise<{
        productionLine: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            isActive: boolean;
        };
        annotations: ({
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
            updatedAt: Date;
            type: import(".prisma/client").$Enums.AnnotationType;
            content: import("@prisma/client/runtime/library").JsonValue;
            machineId: string;
            userId: string;
        })[];
    } & {
        name: string;
        code: string;
        status: import(".prisma/client").$Enums.MachineStatus;
        productionLineId: string;
        schemaImageUrl: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateStatus(id: string, status: MachineStatus): Promise<{
        productionLine: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            isActive: boolean;
        };
    } & {
        name: string;
        code: string;
        status: import(".prisma/client").$Enums.MachineStatus;
        productionLineId: string;
        schemaImageUrl: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    simulateStatusChanges(): Promise<{
        productionLine: {
            name: string;
            id: string;
            createdAt: Date;
            updatedAt: Date;
            description: string | null;
            isActive: boolean;
        };
    } & {
        name: string;
        code: string;
        status: import(".prisma/client").$Enums.MachineStatus;
        productionLineId: string;
        schemaImageUrl: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
