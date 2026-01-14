import { AnnotationType } from '../../../common/enums';
export declare class CreateAnnotationDto {
    type: AnnotationType;
    content: any;
    machineId: string;
    userId: string;
}
