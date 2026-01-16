import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

class LoginDto {
  username: string;
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    // Buscar user por username (com password)
    const user = await this.usersService.findByUsername(loginDto.username);

    if (!user) {
      throw new HttpException('Credenciais inválidas', HttpStatus.UNAUTHORIZED);
    }

    // Verificar password com bcrypt
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      throw new HttpException('Credenciais inválidas', HttpStatus.UNAUTHORIZED);
    }

    // Retornar user SEM password
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      success: true,
      user: userWithoutPassword,
    };
  }
}