export type AddThumbnails = {
  videoId: string;
  thumbnails: {
    imageFileId: string;
    url: string;
  }[];
};
