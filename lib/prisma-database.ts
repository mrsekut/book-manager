import { prisma } from "./prisma";
import type { Book } from "@/features/books/types";
import type { books as PrismaBook } from "@prisma/client";

export class PrismaDatabaseService {
	async getAllBooks(): Promise<Book[]> {
		try {
			const books = await prisma.books.findMany({
				orderBy: {
					created_at: "desc",
				},
			});

			return books.map(this.mapPrismaBookToBook);
		} catch (error) {
			console.error("Error fetching books:", error);
			return [];
		}
	}

	async createBook(book: Omit<Book, "id">): Promise<Book | null> {
		try {
			const createdBook = await prisma.books.create({
				data: {
					title: book.title,
					priority: book.priority,
					next_books: book.nextBooks,
					level: book.level,
					notes: book.notes || null,
					links: book.links || [],
				},
			});

			console.log("Book created successfully:", createdBook.id);
			return this.mapPrismaBookToBook(createdBook);
		} catch (error) {
			console.error("Error creating book:", error);
			throw new Error(
				`Error creating book: ${
					error instanceof Error ? error.message : "Unknown error"
				}`
			);
		}
	}

	async updateBook(id: string, updates: Partial<Book>): Promise<Book | null> {
		try {
			const updatedBook = await prisma.books.update({
				where: { id },
				data: {
					...(updates.title !== undefined && { title: updates.title }),
					...(updates.priority !== undefined && { priority: updates.priority }),
					...(updates.nextBooks !== undefined && {
						next_books: updates.nextBooks,
					}),
					...(updates.level !== undefined && { level: updates.level }),
					...(updates.notes !== undefined && { notes: updates.notes || null }),
					...(updates.links !== undefined && { links: updates.links || [] }),
					updated_at: new Date(),
				},
			});

			return this.mapPrismaBookToBook(updatedBook);
		} catch (error) {
			console.error("Error updating book:", error);
			return null;
		}
	}

	async deleteBook(id: string): Promise<boolean> {
		try {
			await prisma.books.delete({
				where: { id },
			});
			return true;
		} catch (error) {
			console.error("Error deleting book:", error);
			return false;
		}
	}

	async updateAllBooks(books: Book[]): Promise<Book[]> {
		try {
			// Use transaction to update all books
			const results = await prisma.$transaction(
				books.map((book) =>
					prisma.books.upsert({
						where: { id: book.id },
						update: {
							title: book.title,
							priority: book.priority,
							next_books: book.nextBooks,
							level: book.level,
							notes: book.notes || null,
							links: book.links || [],
							updated_at: new Date(),
						},
						create: {
							id: book.id,
							title: book.title,
							priority: book.priority,
							next_books: book.nextBooks,
							level: book.level,
							notes: book.notes || null,
							links: book.links || [],
						},
					})
				)
			);

			return results.map(this.mapPrismaBookToBook);
		} catch (error) {
			console.error("Error updating books:", error);
			return books;
		}
	}

	private mapPrismaBookToBook(prismaBook: PrismaBook): Book {
		return {
			id: prismaBook.id,
			title: prismaBook.title,
			priority: prismaBook.priority as "高" | "未指定",
			nextBooks: prismaBook.next_books,
			level: prismaBook.level,
			notes: prismaBook.notes || undefined,
			links: prismaBook.links.length > 0 ? prismaBook.links : undefined,
		};
	}
}

export const prismaDb = new PrismaDatabaseService();
