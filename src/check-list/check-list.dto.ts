import { PartialType } from '@nestjs/mapped-types';
import { IsIn, IsNotEmpty, IsString } from 'class-validator';
import { EApplicationType } from 'src/shared/interfaces/apllication-type.enum';

export class CreateCheckListDto {
  @IsNotEmpty()
  @IsString()
  content: string;

  @IsNotEmpty()
  @IsIn(Object.values(EApplicationType))
  source: string;
}

export class UpdateCheckListDto extends PartialType(CreateCheckListDto) {}
