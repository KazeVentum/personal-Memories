export interface Book {
  id: string;
  user_id: string;
  title: string;
  author: string | null;
  created_at: string;
}

export interface Reflection {
  id: string;
  user_id: string;
  book_id: string | null;
  page_number: number | null;
  audio_path: string;
  duration_seconds: number | null;
  tags: string[];
  notes: string | null;
  created_at: string;
  books?: Book;
}

export interface Quote {
  id: string;
  user_id: string;
  book_id: string | null;
  page_number: number | null;
  quote_text: string;
  notes: string | null;
  tags: string[];
  created_at: string;
  books?: Book;
}

