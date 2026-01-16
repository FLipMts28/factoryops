import { Controller, Get, Param } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('machine/:machineId')
  async getMessagesByMachine(@Param('machineId') machineId: string) {
    const messages = await this.chatService.findByMachine(machineId);
    // Inverter ordem para mais antigas primeiro (frontend espera assim)
    return messages.reverse();
  }
}