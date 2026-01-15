import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
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
}
