export interface Bookmark {
  id: string;
  user_id: string;
  title: string;
  url: string;
  tags?: string[];
  created_at: string;
  updated_at?: string;
}
