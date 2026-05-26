"use client";
import useSWR from "swr";
import { createClient } from "@/lib/supabase/client";
import type { Book } from "@/types";

const supabase = createClient();

async function fetchBooks(): Promise<Book[]> {
  const { data } = await supabase
    .from("books")
    .select("*")
    .order("title", { ascending: true });
  return data ?? [];
}

export function useBooks() {
  const { data: books = [], isLoading: loading, mutate } = useSWR<Book[]>(
    "books",
    fetchBooks,
    { revalidateOnFocus: false }
  );

  const addBook = async (title: string, author?: string): Promise<Book | null> => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;
    const { data, error } = await supabase
      .from("books")
      .insert({ title, author: author || null, user_id: user.id })
      .select()
      .single();
    if (!error && data) {
      mutate([...books, data].sort((a, b) => a.title.localeCompare(b.title)), false);
      return data;
    }
    return null;
  };

  const updateBook = async (id: string, title: string, author?: string): Promise<boolean> => {
    const { error } = await supabase
      .from("books")
      .update({ title, author: author || null })
      .eq("id", id);
    if (!error) {
      mutate(
        books.map((b) => b.id === id ? { ...b, title, author: author || null } : b)
          .sort((a, b) => a.title.localeCompare(b.title)),
        false
      );
      return true;
    }
    return false;
  };

  const deleteBook = async (id: string): Promise<boolean> => {
    const { error } = await supabase.from("books").delete().eq("id", id);
    if (!error) {
      mutate(books.filter((b) => b.id !== id), false);
      return true;
    }
    return false;
  };

  return { books, loading, addBook, updateBook, deleteBook, refetch: () => mutate() };
}
