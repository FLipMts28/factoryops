import { Controller, Get, Param } from '@nestjs/common';
import { ProductionLinesService } from './production-lines.service';

@Controller('production-lines')
export class ProductionLinesController {
  constructor(private readonly productionLinesService: ProductionLinesService) {}

  @Get()
  async findAll() {
    return this.productionLinesService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.productionLinesService.findOne(id);
  }
}