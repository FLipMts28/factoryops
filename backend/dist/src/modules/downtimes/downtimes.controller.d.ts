import { DowntimesService } from './downtimes.service';
import { CreateDowntimeDto } from './dto/create-downtime.dto';
export declare class DowntimesController {
    private readonly downtimesService;
    constructor(downtimesService: DowntimesService);
    findByMachine(machineId: string): Promise<({
        user: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        machineId: string;
        reason: string;
        startTime: Date;
        endTime: Date | null;
        duration: number | null;
        notes: string | null;
        userId: string;
        createdAt: Date;
    })[]>;
    create(dto: CreateDowntimeDto): Promise<{
        user: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        machineId: string;
        reason: string;
        startTime: Date;
        endTime: Date | null;
        duration: number | null;
        notes: string | null;
        userId: string;
        createdAt: Date;
    }>;
    findAll(): Promise<({
        machine: {
            id: string;
            name: string;
            code: string;
        };
        user: {
            id: string;
            name: string;
        };
    } & {
        id: string;
        machineId: string;
        reason: string;
        startTime: Date;
        endTime: Date | null;
        duration: number | null;
        notes: string | null;
        userId: string;
        createdAt: Date;
    })[]>;
}
