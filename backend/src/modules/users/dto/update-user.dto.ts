import { IsString, IsEnum, IsOptional, MinLength } from 'class-validator';
import { UserRole } from './create-user.dto';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}