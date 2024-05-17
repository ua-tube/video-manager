export class AddThumbnailsDto {
  videoId: string;
  thumbnails: {
    imageFileId: string;
    url: string;
  }[];
}
