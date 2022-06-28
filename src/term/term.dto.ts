import { PartialType } from '@nestjs/mapped-types';
import {
  IsArray,
  IsBoolean,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';

import { EApplicationType } from '../shared/interfaces/apllication-type.enum';

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
  @IsIn(Object.values(EApplicationType))
  source: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  checkLists: string[];
}

export class UpdateTermDto extends PartialType(CreateTermDto) {}
