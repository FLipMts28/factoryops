import { ProductionLinesService } from './production-lines.service';
export declare class ProductionLinesController {
    private readonly productionLinesService;
    constructor(productionLinesService: ProductionLinesService);
    findAll(): Promise<({
        machines: {
            id: string;
            name: string;
            code: string;
            status: import(".prisma/client").$Enums.MachineStatus;
            schemaImageUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
            productionLineId: string;
        }[];
    } & {
        id: string;
        name: string;
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
            id: string;
            name: string;
            code: string;
            status: import(".prisma/client").$Enums.MachineStatus;
            schemaImageUrl: string | null;
            createdAt: Date;
            updatedAt: Date;
            productionLineId: string;
        })[];
    } & {
        id: string;
        name: string;
        createdAt: Date;
        updatedAt: Date;
        description: string | null;
        isActive: boolean;
    }>;
}
