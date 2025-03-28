import { IsArray, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { USER_TYPE } from '../interfaces/Chat.Interface';

class ParticipantDto {
  @IsString()
  id: string;

  @IsString()
  name: string;

  @IsString()
  userType: USER_TYPE;
}

export class CreateConversationDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParticipantDto)
  participants: ParticipantDto[];
} 