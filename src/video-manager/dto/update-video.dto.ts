import { IsIn, IsString, IsUUID } from 'class-validator';
import { VideoVisibility } from '@prisma/client';
import { CanBeNull, CanBeUndefined } from '../../common/decorators';

export class UpdateVideoDto {
  @CanBeUndefined()
  @IsString()
  title?: string;

  @CanBeUndefined()
  @CanBeNull()
  @IsString()
  description?: string;

  @CanBeUndefined()
  @CanBeNull()
  @IsString()
  tags?: string;

  @CanBeUndefined()
  @CanBeNull()
  @IsUUID(4)
  thumbnailId?: string;

  @CanBeUndefined()
  @IsIn(Object.keys(VideoVisibility))
  visibility?: VideoVisibility;
}
