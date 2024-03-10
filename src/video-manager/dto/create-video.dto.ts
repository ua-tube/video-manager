import { IsNotEmpty, IsString } from 'class-validator';
import { CanBeNull, CanBeUndefined } from '../../common/decorators';

export class CreateVideoDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @CanBeUndefined()
  @CanBeNull()
  @IsString()
  description?: string;
}
