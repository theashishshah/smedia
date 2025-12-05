export type MediaItem = {
    id: string;
    type: 'image' | 'video' | 'gif';
    file?: File;       // local file for image/video
    url: string;       // object URL or external gif url
    width?: number;
    height?: number;
  };
  