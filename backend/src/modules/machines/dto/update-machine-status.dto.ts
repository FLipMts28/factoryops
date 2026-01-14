import { IsEnum } from 'class-validator';
import { MachineStatus } from '../../../common/enums';

export class UpdateMachineStatusDto {
  @IsEnum(MachineStatus)
  status: MachineStatus;
}