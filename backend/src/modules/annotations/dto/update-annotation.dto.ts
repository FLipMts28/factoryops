import { IsObject } from 'class-validator';

export class UpdateAnnotationDto {
  @IsObject()
  content: any;
}