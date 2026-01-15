import { IsString, IsEnum, MinLength } from 'class-validator';

export enum UserRole {
  ADMIN = 'ADMIN',
  ENGINEER = 'ENGINEER',
  OPERATOR = 'OPERATOR',
  MAINTENANCE = 'MAINTENANCE',
}

export class CreateUserDto {
  @IsString()
  username: string;

  @IsString()
  name: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsEnum(UserRole)
  role: UserRole;
}