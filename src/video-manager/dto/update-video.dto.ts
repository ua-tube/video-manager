import { IsIn, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { VideoVisibility } from '@prisma/client';

export class UpdateVideoDto {
  @IsNotEmpty()
  @IsString()
  title: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  tags: string;

  @IsNotEmpty()
  @IsUUID(4)
  thumbnailId: string;

  @IsNotEmpty()
  @IsIn(Object.keys(VideoVisibility))
  visibility: VideoVisibility;
}
