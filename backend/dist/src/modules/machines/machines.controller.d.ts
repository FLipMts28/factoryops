import { MachinesService } from './machines.service';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineStatusDto } from './dto/update-machine-status.dto';
export declare class MachinesController {
    private readonly machinesService;
    constructor(machinesService: MachinesService);
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
    updateStatus(id: string, updateStatusDto: UpdateMachineStatusDto): Promise<{
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
