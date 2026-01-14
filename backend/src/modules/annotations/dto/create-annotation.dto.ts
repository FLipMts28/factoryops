import { IsEnum, IsString, IsObject, IsUUID } from 'class-validator';
import { AnnotationType } from '../../../common/enums';

export class CreateAnnotationDto {
  @IsEnum(AnnotationType)
  type: AnnotationType;

  @IsObject()
  content: any;

  @IsUUID()
  machineId: string;

  @IsUUID()
  userId: string;
}