import { IsString, IsEnum, IsOptional } from 'class-validator';
import { MachineStatus } from '../../../common/enums';

export class CreateMachineDto {
  @IsString()
  name: string;

  @IsString()
  code: string;

  @IsEnum(MachineStatus)
  status: MachineStatus;

  @IsString()
  productionLineId: string;

  @IsOptional()
  @IsString()
  schemaImageUrl?: string;
}