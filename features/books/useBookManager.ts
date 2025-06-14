import { useAtom } from "jotai";
import {
	booksAtom,
	selectedBookIdAtom,
	expandedBooksAtom,
	activeTabAtom,
	newBookTitleAtom,
	highPriorityBooksAtom,
} from "@/features/books/bookAtoms";
import {
	addBookToList,
	deleteBookFromList,
	toggleBookPriority,
	moveBookWithKeyboard,
	toggleExpandState,
} from "@/features/books/bookLogic";
import { useEffect, useState, useCallback } from "react";
import { db } from "@/lib/database";

export function useBookManager() {
	const [books, setBooks] = useAtom(booksAtom);
	const [selectedBookId, setSelectedBookId] = useAtom(selectedBookIdAtom);
	const [expandedBooks, setExpandedBooks] = useAtom(expandedBooksAtom);
	const [activeTab, setActiveTab] = useAtom(activeTabAtom);
	const [newBookTitle, setNewBookTitle] = useAtom(newBookTitleAtom);
	const [highPriorityBooks] = useAtom(highPriorityBooksAtom);
	const [isLoading, setIsLoading] = useState(true);

	// Supabaseからデータを読み込む
	const loadBooks = useCallback(async () => {
		try {
			setIsLoading(true);
			const fetchedBooks = await db.getAllBooks();
			setBooks(fetchedBooks);
		} catch (error) {
			console.error('Failed to load books:', error);
		} finally {
			setIsLoading(false);
		}
	}, [setBooks]);

	useEffect(() => {
		loadBooks();
	}, [loadBooks]);

	// データをSupabaseに保存する関数
	const saveBooks = useCallback(async (updatedBooks: typeof books) => {
		try {
			await db.updateAllBooks(updatedBooks);
		} catch (error) {
			console.error('Failed to save books:', error);
		}
	}, []);

	// 本を追加
	const addBook = async () => {
		if (newBookTitle.trim() === "") {
			return;
		}

		try {
			const { id, ...bookWithoutId } = {
				id: '', // Temporary ID, will be replaced by Supabase
				title: newBookTitle.trim(),
				priority: "高" as const,
				nextBooks: [],
				level: 0,
			};

			// Create book in database
			const createdBook = await db.createBook(bookWithoutId);
			if (createdBook) {
				// Add the created book with the real ID to the list
				setBooks([...books, createdBook]);
				setNewBookTitle("");
				setSelectedBookId(createdBook.id);
			}
		} catch (error) {
			console.error('Failed to create book:', error);
			alert(`本の作成に失敗しました: ${error instanceof Error ? error.message : 'Unknown error'}`);
		}
	};

	// 本を削除
	const deleteBook = async (id: string) => {
		try {
			const success = await db.deleteBook(id);
			if (success) {
				const updatedBooks = deleteBookFromList(books, id);
				setBooks(updatedBooks);
				if (selectedBookId === id) {
					setSelectedBookId(null);
				}
			}
		} catch (error) {
			console.error('Failed to delete book:', error);
		}
	};

	// 優先順位を変更
	const togglePriority = async (id: string) => {
		const updatedBooks = toggleBookPriority(books, id);
		setBooks(updatedBooks);
		await saveBooks(updatedBooks);
	};

	// 本の展開状態を切り替え
	const toggleExpand = (id: string) => {
		const updatedExpandedBooks = toggleExpandState(expandedBooks, id);
		setExpandedBooks(updatedExpandedBooks);
	};

	// キーボードショートカット処理
	const handleKeyDown = async (
		e: React.KeyboardEvent<HTMLDivElement>,
		bookId: string
	) => {
		if (e.altKey) {
			e.preventDefault();
			let direction: "up" | "down" | "right" | "left" | null = null;

			switch (e.key) {
				case "ArrowUp":
					direction = "up";
					break;
				case "ArrowDown":
					direction = "down";
					break;
				case "ArrowRight":
					direction = "right";
					break;
				case "ArrowLeft":
					direction = "left";
					break;
			}

			if (direction) {
				const updatedBooks = moveBookWithKeyboard(books, bookId, direction);
				setBooks(updatedBooks);
				await saveBooks(updatedBooks);
			}
		}
	};

	// 本を選択
	const handleSelectBook = (id: string) => {
		setSelectedBookId(id === selectedBookId ? null : id);
	};

	// 本のメモを更新
	const updateBookNotes = async (id: string, notes: string) => {
		const updatedBooks = books.map((book) =>
			book.id === id ? { ...book, notes } : book
		);
		setBooks(updatedBooks);
		
		try {
			await db.updateBook(id, { notes });
		} catch (error) {
			console.error('Failed to update book notes:', error);
		}
	};

	// 本にリンクを追加
	const addBookLink = async (id: string, link: string) => {
		const updatedBooks = books.map((book) =>
			book.id === id
				? { ...book, links: [...(book.links || []), link] }
				: book
		);
		setBooks(updatedBooks);

		try {
			const book = books.find(b => b.id === id);
			if (book) {
				await db.updateBook(id, { links: [...(book.links || []), link] });
			}
		} catch (error) {
			console.error('Failed to add book link:', error);
		}
	};

	// 本のリンクを削除
	const removeBookLink = async (id: string, linkIndex: number) => {
		const updatedBooks = books.map((book) =>
			book.id === id
				? {
						...book,
						links: book.links?.filter((_, index) => index !== linkIndex) || [],
				  }
				: book
		);
		setBooks(updatedBooks);

		try {
			const book = books.find(b => b.id === id);
			if (book) {
				const newLinks = book.links?.filter((_, index) => index !== linkIndex) || [];
				await db.updateBook(id, { links: newLinks });
			}
		} catch (error) {
			console.error('Failed to remove book link:', error);
		}
	};

	return {
		books,
		setBooks,
		selectedBookId,
		setSelectedBookId,
		expandedBooks,
		setExpandedBooks,
		activeTab,
		setActiveTab,
		newBookTitle,
		setNewBookTitle,
		addBook,
		deleteBook,
		togglePriority,
		toggleExpand,
		handleKeyDown,
		handleSelectBook,
		highPriorityBooks,
		updateBookNotes,
		addBookLink,
		removeBookLink,
		isLoading,
	};
}