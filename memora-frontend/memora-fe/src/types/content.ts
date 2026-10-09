export type ContentType ="youtube" | "twitter" | "image"| "video"| "article"| "audio" | "pdf";

export interface Content {
  _id: string;
  title: string;
  link: string;
  type: ContentType;
  description?: string;
}
