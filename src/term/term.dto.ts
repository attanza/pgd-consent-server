import { PartialType } from '@nestjs/mapped-types';
import { IsArray, IsBoolean, IsMongoId, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateTermDto {
  @IsNotEmpty()
  @MaxLength(150)
  title: string;

  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsBoolean()
  isPublish: boolean;

  @IsNotEmpty()
  @IsMongoId()
  source: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  checkLists: string[];
}

export class UpdateTermDto extends PartialType(CreateTermDto) {}
