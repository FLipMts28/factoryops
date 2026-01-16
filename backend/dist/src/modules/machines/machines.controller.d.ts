import { MachinesService } from './machines.service';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineStatusDto } from './dto/update-machine-status.dto';
export declare class MachinesController {
    private readonly machinesService;
    constructor(machinesService: MachinesService);
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
    updateStatus(id: string, updateStatusDto: UpdateMachineStatusDto): Promise<{
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
