import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MachinesModule } from './modules/machines/machines.module';
import { AnnotationsModule } from './modules/annotations/annotations.module';
import { ChatModule } from './modules/chat/chat.module';
import { ProductionLinesModule } from './modules/production-lines/production-lines.module';
import { UsersModule } from './modules/users/users.module';

@Module({
  imports: [
    MachinesModule,
    AnnotationsModule,
    ChatModule,
    ProductionLinesModule,
    UsersModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}