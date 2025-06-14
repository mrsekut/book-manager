import { supabase } from './supabase'
import type { Book } from '@/features/books/types'

export class DatabaseService {
  async getAllBooks(): Promise<Book[]> {
    const { data, error } = await supabase
      .from('books')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching books:', error)
      return []
    }

    return data.map(this.mapDbBookToBook)
  }

  async createBook(book: Omit<Book, 'id'>): Promise<Book | null> {
    const { data, error } = await supabase
      .from('books')
      .insert([this.mapBookToDbBook(book)])
      .select()
      .single()

    if (error) {
      console.error('Error creating book:', error)
      return null
    }

    return this.mapDbBookToBook(data)
  }

  async updateBook(id: string, updates: Partial<Book>): Promise<Book | null> {
    const { data, error } = await supabase
      .from('books')
      .update({
        ...this.mapBookToDbBook(updates),
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating book:', error)
      return null
    }

    return this.mapDbBookToBook(data)
  }

  async deleteBook(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('books')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting book:', error)
      return false
    }

    return true
  }

  async updateAllBooks(books: Book[]): Promise<Book[]> {
    const updates = books.map((book) => ({
      ...this.mapBookToDbBook(book),
      updated_at: new Date().toISOString()
    }))

    const { data, error } = await supabase
      .from('books')
      .upsert(updates)
      .select()

    if (error) {
      console.error('Error updating books:', error)
      return books
    }

    return data.map(this.mapDbBookToBook)
  }

  private mapDbBookToBook(dbBook: any): Book {
    return {
      id: dbBook.id,
      title: dbBook.title,
      priority: dbBook.priority,
      nextBooks: dbBook.next_books || [],
      level: dbBook.level || 0,
      notes: dbBook.notes || undefined,
      links: dbBook.links || undefined
    }
  }

  private mapBookToDbBook(book: Partial<Book>): any {
    return {
      ...(book.id && { id: book.id }),
      ...(book.title && { title: book.title }),
      ...(book.priority && { priority: book.priority }),
      ...(book.nextBooks !== undefined && { next_books: book.nextBooks }),
      ...(book.level !== undefined && { level: book.level }),
      ...(book.notes !== undefined && { notes: book.notes || null }),
      ...(book.links !== undefined && { links: book.links || null })
    }
  }
}

export const db = new DatabaseService()