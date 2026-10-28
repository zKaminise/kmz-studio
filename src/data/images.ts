import manifest from "./project-images.json";
export type ImageAsset = {
  src: string;
  srcSet?: string;
  width: number;
  height: number;
  alt?: string;
};
type ProjectImages = ImageAsset & { gallery: ImageAsset[] };
export const images = manifest as Record<string, ProjectImages>;
