import { PrismaService } from '../../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createUserDto: CreateUserDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        username: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
    findAll(): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        username: string;
        role: import(".prisma/client").$Enums.UserRole;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        username: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        username: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
    remove(id: string): Promise<{
        id: string;
        name: string;
        username: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
    findByUsername(username: string): Promise<{
        id: string;
        name: string;
        createdAt: Date;
        username: string;
        password: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
}
