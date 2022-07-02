import { PartialType } from '@nestjs/mapped-types';
import { IsArray, IsIP, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateSourceDto {
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @IsOptional()
  @MaxLength(255)
  description: string;

  @IsOptional()
  @IsArray()
  @IsIP('4', { each: true })
  ipAddresses: string[];
}

export class UpdateSourceDto extends PartialType(CreateSourceDto) {}
