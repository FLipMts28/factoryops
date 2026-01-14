import { Controller, Get, Post, Put, Delete, Param, Body } from '@nestjs/common';
import { AnnotationsService } from './annotations.service';
import { CreateAnnotationDto } from './dto/create-annotation.dto';
import { UpdateAnnotationDto } from './dto/update-annotation.dto';

@Controller('annotations')
export class AnnotationsController {
  constructor(private readonly annotationsService: AnnotationsService) {}

  @Get('machine/:machineId')
  async findByMachine(@Param('machineId') machineId: string) {
    return this.annotationsService.findByMachine(machineId);
  }

  @Post()
  async create(@Body() createDto: CreateAnnotationDto) {
    return this.annotationsService.create(createDto);
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateAnnotationDto) {
    return this.annotationsService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.annotationsService.remove(id);
  }
}