import { AnnotationsService } from './annotations.service';
import { CreateAnnotationDto } from './dto/create-annotation.dto';
import { UpdateAnnotationDto } from './dto/update-annotation.dto';
export declare class AnnotationsController {
    private readonly annotationsService;
    constructor(annotationsService: AnnotationsService);
    findByMachine(machineId: string): Promise<({
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
    })[]>;
    create(createDto: CreateAnnotationDto): Promise<{
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
    }>;
    update(id: string, updateDto: UpdateAnnotationDto): Promise<{
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
