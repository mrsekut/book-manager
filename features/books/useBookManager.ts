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
import { useEffect } from "react";

export function useBookManager() {
	const [books, setBooks] = useAtom(booksAtom);
	const [selectedBookId, setSelectedBookId] = useAtom(selectedBookIdAtom);
	const [expandedBooks, setExpandedBooks] = useAtom(expandedBooksAtom);
	const [activeTab, setActiveTab] = useAtom(activeTabAtom);
	const [newBookTitle, setNewBookTitle] = useAtom(newBookTitleAtom);
	const [highPriorityBooks] = useAtom(highPriorityBooksAtom);

	// ローカルストレージからデータを読み込む
	useEffect(() => {
		const savedBooks = localStorage.getItem("books");
		if (savedBooks) {
			setBooks(JSON.parse(savedBooks));
		}
		// eslint-disable-next-line
	}, []);

	// データをローカルストレージに保存
	useEffect(() => {
		localStorage.setItem("books", JSON.stringify(books));
	}, [books]);

	// 本を追加
	const addBook = () => {
		const result = addBookToList(books, newBookTitle);
		if (result.newBookId) {
			setBooks(result.books);
			setNewBookTitle("");
			setSelectedBookId(result.newBookId);
		}
	};

	// 本を削除
	const deleteBook = (id: string) => {
		const updatedBooks = deleteBookFromList(books, id);
		setBooks(updatedBooks);
		if (selectedBookId === id) {
			setSelectedBookId(null);
		}
	};

	// 優先順位を変更
	const togglePriority = (id: string) => {
		const updatedBooks = toggleBookPriority(books, id);
		setBooks(updatedBooks);
	};

	// 本の展開状態を切り替え
	const toggleExpand = (id: string) => {
		const updatedExpandedBooks = toggleExpandState(expandedBooks, id);
		setExpandedBooks(updatedExpandedBooks);
	};

	// キーボードショートカット処理
	const handleKeyDown = (
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
			}
		}
	};

	// 本を選択
	const handleSelectBook = (id: string) => {
		setSelectedBookId(id === selectedBookId ? null : id);
	};

	// 本のメモを更新
	const updateBookNotes = (id: string, notes: string) => {
		const updatedBooks = books.map((book) =>
			book.id === id ? { ...book, notes } : book
		);
		setBooks(updatedBooks);
	};

	// 本にリンクを追加
	const addBookLink = (id: string, link: string) => {
		const updatedBooks = books.map((book) =>
			book.id === id
				? { ...book, links: [...(book.links || []), link] }
				: book
		);
		setBooks(updatedBooks);
	};

	// 本のリンクを削除
	const removeBookLink = (id: string, linkIndex: number) => {
		const updatedBooks = books.map((book) =>
			book.id === id
				? {
						...book,
						links: book.links?.filter((_, index) => index !== linkIndex) || [],
				  }
				: book
		);
		setBooks(updatedBooks);
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
	};
}
