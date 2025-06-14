import { supabase, type Database } from "./supabase";
import type { Book } from "@/features/books/types";

export class DatabaseService {
	async getAllBooks(): Promise<Book[]> {
		const { data, error } = await supabase
			.from("books")
			.select("*")
			.order("created_at", { ascending: false });

		if (error) {
			console.error("Error fetching books:", error);
			return [];
		}

		return data.map(this.mapDbBookToBook);
	}

	async createBook(book: Omit<Book, "id">): Promise<Book | null> {
		const bookData = this.mapBookToDbBook(book);
		console.log("Creating book with data:", bookData);

		const { data, error } = await supabase
			.from("books")
			.insert([bookData])
			.select()
			.single();

		if (error) {
			console.error(
				"Error creating book:",
				error.message,
				error.details,
				error.hint
			);
			throw new Error(`Error creating book: ${error.message}`);
		}

		return this.mapDbBookToBook(data);
	}

	async updateBook(id: string, updates: Partial<Book>): Promise<Book | null> {
		const dbUpdates = this.mapBookToDbBook(updates);

		const { data, error } = await supabase
			.from("books")
			.update({
				...dbUpdates,
				updated_at: new Date().toISOString(),
			})
			.eq("id", id)
			.select()
			.single();

		if (error) {
			console.error("Error updating book:", error);
			return null;
		}

		return this.mapDbBookToBook(data);
	}

	async deleteBook(id: string): Promise<boolean> {
		const { error } = await supabase.from("books").delete().eq("id", id);

		if (error) {
			console.error("Error deleting book:", error);
			return false;
		}

		return true;
	}

	async updateAllBooks(books: Book[]): Promise<Book[]> {
		const updates = books.map((book) => ({
			id: book.id, // Include id for upsert
			...this.mapBookToDbBook(book),
			updated_at: new Date().toISOString(),
		}));

		const { data, error } = await supabase
			.from("books")
			.upsert(updates)
			.select();

		if (error) {
			console.error("Error updating books:", error);
			return books;
		}

		return data.map(this.mapDbBookToBook);
	}

	private mapDbBookToBook(
		dbBook: Database["public"]["Tables"]["books"]["Row"]
	): Book {
		return {
			id: dbBook.id,
			title: dbBook.title,
			priority: dbBook.priority,
			nextBooks: dbBook.next_books || [],
			level: dbBook.level || 0,
			notes: dbBook.notes || undefined,
			links: dbBook.links || undefined,
		};
	}

	private mapBookToDbBook(
		book: Partial<Book>
	): Partial<Database["public"]["Tables"]["books"]["Insert"]> {
		// Don't include id when creating new books (let Supabase generate UUID)
		const dbBook: Partial<Database["public"]["Tables"]["books"]["Insert"]> = {};

		if (book.title !== undefined) dbBook.title = book.title;
		if (book.priority !== undefined) dbBook.priority = book.priority;
		if (book.nextBooks !== undefined) dbBook.next_books = book.nextBooks;
		if (book.level !== undefined) dbBook.level = book.level;
		if (book.notes !== undefined) dbBook.notes = book.notes || null;
		if (book.links !== undefined) dbBook.links = book.links || null;

		return dbBook;
	}
}

export const db = new DatabaseService();
