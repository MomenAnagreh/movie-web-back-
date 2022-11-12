// import { PartialType } from '@nestjs/mapped-types';
import { PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { SignUpCredentialsDto } from './signup.dto';

export class UpdateCredentialDto extends PartialType(SignUpCredentialsDto) {
  @IsString()
  @IsOptional()
  wish: string;
}
