import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { DowntimesService } from './downtimes.service';
import { CreateDowntimeDto } from './dto/create-downtime.dto';

@Controller('downtimes')
export class DowntimesController {
  constructor(private readonly downtimesService: DowntimesService) {}

  @Get('machine/:machineId')
  async findByMachine(@Param('machineId') machineId: string) {
    return this.downtimesService.findByMachine(machineId);
  }

  @Post()
  async create(@Body() dto: CreateDowntimeDto) {
    console.log('📨 POST /downtimes - Body recebido:', JSON.stringify(dto, null, 2));
    return this.downtimesService.create(dto);
  }

  @Get()
  async findAll() {
    return this.downtimesService.findAll();
  }
}