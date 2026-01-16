import { PrismaService } from '../../../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersService {
    private prisma;
    constructor(prisma: PrismaService);
    create(createUserDto: CreateUserDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        username: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
    findAll(): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        username: string;
        role: import(".prisma/client").$Enums.UserRole;
    }[]>;
    findOne(id: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        username: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        username: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
    remove(id: string): Promise<{
        name: string;
        id: string;
        username: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
    findByUsername(username: string): Promise<{
        name: string;
        id: string;
        createdAt: Date;
        username: string;
        password: string;
        role: import(".prisma/client").$Enums.UserRole;
    }>;
}
