import { IsEmail, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { isObjectIdOrHexString } from 'mongoose';
import { UserRole } from '../enums/user-role.enum';

export class RefreshTokenDto {
  @IsString()
  // @IsUUID()
  readonly id: string;

  @IsString()
  readonly username: string;

  @IsString()
  @IsEmail()
  readonly email: string;

  @IsOptional()
  @IsEnum(UserRole)
  readonly role: string;

  @IsString()
  tmdb_key: string;
}
