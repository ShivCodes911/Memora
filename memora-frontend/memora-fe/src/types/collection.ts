export interface Collection {
  _id: string;
  title: string;
  icon: string;
  userId: string;
  parentId?: string | null;
  shareHash?: string;
  createdAt?: string;
  updatedAt?: string;
  count?: number;
}
