import { PartialType } from '@nestjs/mapped-types';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';

export class CreateCheckListDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsMongoId()
  source: string;
}

export class UpdateCheckListDto extends PartialType(CreateCheckListDto) {}
