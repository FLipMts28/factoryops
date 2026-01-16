import { MachineStatus } from '../../../common/enums';
export declare class CreateMachineDto {
    name: string;
    code: string;
    status: MachineStatus;
    productionLineId: string;
    schemaImageUrl?: string;
}
