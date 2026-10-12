export interface Collection {
  _id: string;
  title: string;
  icon: string;
  userId: string;
  shareHash?: string;
  createdAt?: string;
  updatedAt?: string;
  count?: number;
}
