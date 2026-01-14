// backend/src/modules/chat/chat.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateMessageDto } from './dto/create-message.dto';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async findByMachine(machineId: string, limit = 50) {
    return this.prisma.chatMessage.findMany({
      where: { machineId },
      include: { user: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async create(data: CreateMessageDto) {
    const message = await this.prisma.chatMessage.create({
      data: {
        content: data.content,
        machineId: data.machineId,
        userId: data.userId,
      },
      include: { user: true },
    });

    await this.prisma.eventLog.create({
      data: {
        eventType: 'MESSAGE_SENT',
        description: `Message sent in machine chat`,
        machineId: data.machineId,
        userId: data.userId,
      },
    });

    return message;
  }
}
