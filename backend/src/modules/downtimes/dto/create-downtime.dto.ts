import { IsString, IsNotEmpty, IsOptional, IsDateString } from 'class-validator';

export class CreateDowntimeDto {
  @IsString()
  @IsNotEmpty()
  machineId: string;

  @IsString()
  @IsNotEmpty()
  reason: string;

  @IsDateString()
  @IsNotEmpty()
  startTime: string;

  @IsDateString()
  @IsOptional()
  endTime?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}