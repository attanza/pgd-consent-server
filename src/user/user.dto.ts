import {
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
} from 'class-validator';
import { EUserRole } from 'src/shared/interfaces/user-role.enum';

export class CreateUserDto {
  @IsNotEmpty()
  @MaxLength(150)
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsOptional()
  @IsIn(Object.values(EUserRole))
  role: string;
}

export class UpdateUserDto {
  @IsOptional()
  @MaxLength(150)
  name: string;

  @IsOptional()
  @IsEmail()
  email: string;

  @IsOptional()
  @IsIn(Object.values(EUserRole))
  role: string;
}
