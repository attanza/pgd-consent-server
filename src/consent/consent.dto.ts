import { PartialType } from '@nestjs/mapped-types';
import {
  IsArray,
  IsEmail,
  IsIn,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  MaxLength,
} from 'class-validator';
import { EApplicationType } from '../shared/interfaces/apllication-type.enum';

export class CreateConsentDto {
  @IsOptional()
  @MaxLength(30)
  nik: string;

  @IsOptional()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @MaxLength(30)
  phone: string;

  @IsNotEmpty()
  @IsIn(Object.values(EApplicationType))
  source: string;

  @IsOptional()
  @IsMongoId()
  term: string;

  @IsOptional()
  @IsArray()
  @IsMongoId({ each: true })
  checkLists: string[];
}

export class UpdateConsentDto extends PartialType(CreateConsentDto) {}
