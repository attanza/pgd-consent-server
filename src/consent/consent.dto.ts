import { PartialType } from '@nestjs/mapped-types';
import { IsArray, IsEmail, IsMongoId, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class CreateConsentDto {
  @IsOptional()
  @MaxLength(20)
  cif: string;

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
  @IsMongoId()
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
