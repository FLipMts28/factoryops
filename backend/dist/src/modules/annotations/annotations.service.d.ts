import { PrismaService } from '../../../prisma/prisma.service';
import { CreateAnnotationDto } from './dto/create-annotation.dto';
import { UpdateAnnotationDto } from './dto/update-annotation.dto';
export declare class AnnotationsService {
    private prisma;
    constructor(prisma: PrismaService);
    findByMachine(machineId: string): Promise<({
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
    })[]>;
    create(data: CreateAnnotationDto): Promise<{
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
    update(id: string, data: UpdateAnnotationDto): Promise<{
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
    remove(id: string): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        type: import(".prisma/client").$Enums.AnnotationType;
        content: import("@prisma/client/runtime/library").JsonValue;
        machineId: string;
        userId: string;
    }>;
}
