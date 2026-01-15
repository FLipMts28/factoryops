import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(createUserDto: CreateUserDto) {
    // Verificar se username já existe
    const existingUser = await this.prisma.user.findUnique({
      where: { username: createUserDto.username },
    });

    if (existingUser) {
      throw new ConflictException('Username já existe');
    }

    // Hash da password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    return this.prisma.user.create({
      data: {
        username: createUserDto.username,
        name: createUserDto.name,
        password: hashedPassword,
        role: createUserDto.role,
      },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
        // NÃO retornar password
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
        // NÃO retornar password
      },
      orderBy: {
        name: 'asc',
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
        // NÃO retornar password
      },
    });

    if (!user) {
      throw new NotFoundException('Utilizador não encontrado');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    // Verificar se user existe
    await this.findOne(id);

    const data: any = {};

    if (updateUserDto.name) {
      data.name = updateUserDto.name;
    }

    if (updateUserDto.role) {
      data.role = updateUserDto.role;
    }

    if (updateUserDto.password) {
      data.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    return this.prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
        // NÃO retornar password
      },
    });
  }

  async remove(id: string) {
    // Verificar se user existe
    await this.findOne(id);

    return this.prisma.user.delete({
      where: { id },
      select: {
        id: true,
        username: true,
        name: true,
        role: true,
      },
    });
  }

  // Para login (usado pelo auth)
  async findByUsername(username: string) {
    return this.prisma.user.findUnique({
      where: { username },
    });
  }
}