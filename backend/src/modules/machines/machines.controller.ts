import { Controller, Get, Param, Patch, Body } from '@nestjs/common';
import { MachinesService } from './machines.service';
import { UpdateMachineStatusDto } from './dto/update-machine-status.dto';

@Controller('machines')
export class MachinesController {
  constructor(private readonly machinesService: MachinesService) {}

  @Get()
  async findAll() {
    return this.machinesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.machinesService.findOne(id);
  }

  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateMachineStatusDto,
  ) {
    return this.machinesService.updateStatus(id, updateStatusDto.status);
  }
}
