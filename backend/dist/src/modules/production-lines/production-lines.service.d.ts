import { PrismaService } from '../../../prisma/prisma.service';
export declare class ProductionLinesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(): Promise<({
        machines: {
            name: string;
            code: string;
            status: import(".prisma/client").$Enums.MachineStatus;
            productionLineId: string;
            schemaImageUrl: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        }[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
    })[]>;
    findOne(id: string): Promise<{
        machines: ({
            annotations: {
                id: string;
                createdAt: Date;
                updatedAt: Date;
                type: import(".prisma/client").$Enums.AnnotationType;
                content: import("@prisma/client/runtime/library").JsonValue;
                machineId: string;
                userId: string;
            }[];
        } & {
            name: string;
            code: string;
            status: import(".prisma/client").$Enums.MachineStatus;
            productionLineId: string;
            schemaImageUrl: string | null;
            id: string;
            createdAt: Date;
            updatedAt: Date;
        })[];
    } & {
        name: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
    }>;
}
