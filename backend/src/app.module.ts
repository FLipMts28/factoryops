import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { MachinesModule } from './modules/machines/machines.module';
import { AnnotationsModule } from './modules/annotations/annotations.module';
import { ChatModule } from './modules/chat/chat.module';
import { ProductionLinesModule } from './modules/production-lines/production-lines.module';
import { UsersModule } from './modules/users/users.module';
import { DowntimesModule } from './modules/downtimes/downtimes.module';
import { AuthController } from './modules/auth/auth.controller';

@Module({
  controllers: [AuthController],
  imports: [
    PrismaModule,
    MachinesModule,
    AnnotationsModule,
    ChatModule,
    ProductionLinesModule,
    UsersModule,
    DowntimesModule,
  ],
})
export class AppModule {}