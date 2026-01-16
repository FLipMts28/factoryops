import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { IsString, IsNotEmpty } from 'class-validator';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

class LoginDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

@Controller('auth')
export class AuthController {
  constructor(private readonly usersService: UsersService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    console.log('🔐 Login request recebido:', JSON.stringify(loginDto));
    console.log('🔐 Username:', loginDto.username);
    console.log('🔐 Password:', loginDto.password ? '***' : 'undefined');

    // Validação básica
    if (!loginDto.username || !loginDto.password) {
      console.log('❌ Username ou password em falta');
      throw new HttpException('Username e password são obrigatórios', HttpStatus.BAD_REQUEST);
    }

    // Buscar user por username (com password)
    const user = await this.usersService.findByUsername(loginDto.username);

    if (!user) {
      console.log('❌ User não encontrado:', loginDto.username);
      throw new HttpException('Credenciais inválidas', HttpStatus.UNAUTHORIZED);
    }

    console.log('✅ User encontrado:', user.username);

    // Verificar password com bcrypt
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);

    if (!isPasswordValid) {
      console.log('❌ Password inválida para:', loginDto.username);
      throw new HttpException('Credenciais inválidas', HttpStatus.UNAUTHORIZED);
    }

    console.log('✅ Login bem-sucedido:', user.username);

    // Retornar user SEM password
    const { password: _, ...userWithoutPassword } = user;
    
    return {
      success: true,
      user: userWithoutPassword,
    };
  }
}