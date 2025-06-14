import type { Book } from "@/features/books/types";

// 本を追加するロジック
export function addBookToList(
	books: Book[],
	title: string
): { books: Book[]; newBookId: string } {
	if (title.trim() === "") {
		return { books, newBookId: "" };
	}

	const newBook: Book = {
		id: Date.now().toString(),
		title: title.trim(),
		priority: "高",
		nextBooks: [],
		level: 0,
	};

	// 直前の本があり、それが新しい本の親になる可能性がある場合
	if (books.length > 0) {
		const lastBook = books[books.length - 1];
		newBook.level = Math.min(lastBook.level, 1);
		if (newBook.level === 1) {
			newBook.priority = "未指定";
		}
	}

	return {
		books: [...books, newBook],
		newBookId: newBook.id,
	};
}

// 本を削除するロジック
export function deleteBookFromList(books: Book[], id: string): Book[] {
	// 削除する本を参照している本から参照を削除
	const updatedBooks = books.map((book) => ({
		...book,
		nextBooks: book.nextBooks.filter((nextId) => nextId !== id),
	}));

	// 本自体を削除
	return updatedBooks.filter((book) => book.id !== id);
}

// 優先順位を変更するロジック
export function toggleBookPriority(books: Book[], id: string): Book[] {
	return books.map((book) => {
		if (book.id === id && book.level === 0) {
			return {
				...book,
				priority: book.priority === "高" ? "未指定" : "高",
			};
		}
		return book;
	});
}

// 同じレベルの前の本を見つける
function findPreviousSiblingIndex(books: Book[], currentIndex: number): number {
	const currentLevel = books[currentIndex].level;
	for (let i = currentIndex - 1; i >= 0; i--) {
		if (books[i].level === currentLevel) {
			return i;
		}
	}
	return -1;
}

// 同じレベルの次の本を見つける
function findNextSiblingIndex(books: Book[], currentIndex: number): number {
	const currentLevel = books[currentIndex].level;
	for (let i = currentIndex + 1; i < books.length; i++) {
		if (books[i].level === currentLevel) {
			return i;
		}
	}
	return -1;
}

// 本とその子孫をすべて取得する
function getBookAndDescendants(books: Book[], startIndex: number): number[] {
	const result: number[] = [startIndex];
	const startBook = books[startIndex];
	const startLevel = startBook.level;
	let i = startIndex + 1;
	while (i < books.length && books[i].level > startLevel) {
		result.push(i);
		i++;
	}
	return result;
}

// キーボードショートカットによる本の移動処理
export function moveBookWithKeyboard(
	books: Book[],
	bookId: string,
	direction: "up" | "down" | "right" | "left"
): Book[] {
	const booksCopy = [...books];
	const bookIndex = booksCopy.findIndex((b) => b.id === bookId);
	const currentBook = booksCopy[bookIndex];

	if (bookIndex === -1) return books;

	switch (direction) {
		case "up": {
			const prevSiblingIndex = findPreviousSiblingIndex(booksCopy, bookIndex);
			if (prevSiblingIndex !== -1) {
				const currentAndDescendants = getBookAndDescendants(
					booksCopy,
					bookIndex
				);
				const itemsToMove = currentAndDescendants.map((idx) => booksCopy[idx]);

				// 移動する本とその子孫を元の配列から削除（インデックスの大きい順に削除）
				currentAndDescendants
					.sort((a, b) => b - a)
					.forEach((idx) => {
						booksCopy.splice(idx, 1);
					});

				// 前の兄弟の位置に挿入
				booksCopy.splice(prevSiblingIndex, 0, ...itemsToMove);
			}
			break;
		}
		case "down": {
			const nextSiblingIndex = findNextSiblingIndex(booksCopy, bookIndex);
			if (nextSiblingIndex !== -1) {
				const currentAndDescendants = getBookAndDescendants(
					booksCopy,
					bookIndex
				);
				const nextAndDescendants = getBookAndDescendants(
					booksCopy,
					nextSiblingIndex
				);
				const insertPosition =
					nextAndDescendants[nextAndDescendants.length - 1];
				const itemsToMove = currentAndDescendants.map((idx) => booksCopy[idx]);

				// 移動する本とその子孫を元の配列から削除（インデックスの大きい順に削除）
				currentAndDescendants
					.sort((a, b) => b - a)
					.forEach((idx) => {
						booksCopy.splice(idx, 1);
					});

				// 次の兄弟の子孫の後に挿入
				booksCopy.splice(
					insertPosition + 1 - currentAndDescendants.length,
					0,
					...itemsToMove
				);
			}
			break;
		}
		case "right": {
			if (bookIndex > 0) {
				const parentIndex = bookIndex - 1;
				const parentBook = booksCopy[parentIndex];
				const newLevel = Math.min(parentBook.level + 1, 1);

				// 現在の本を更新
				const updatedBook = {
					...currentBook,
					level: newLevel,
					priority: newLevel === 1 ? "未指定" : currentBook.priority,
				};
				booksCopy[bookIndex] = updatedBook;

				// 親の本の nextBooks に現在の本を追加（まだ含まれていない場合）
				if (!parentBook.nextBooks.includes(currentBook.id)) {
					booksCopy[parentIndex] = {
						...parentBook,
						nextBooks: [...parentBook.nextBooks, currentBook.id],
					};
				}
			}
			break;
		}
		case "left": {
			if (currentBook.level > 0) {
				const parentBook = booksCopy.find((book) =>
					book.nextBooks.includes(currentBook.id)
				);
				const newLevel = currentBook.level - 1;

				// 現在の本を更新
				const updatedBook = {
					...currentBook,
					level: newLevel,
				};
				booksCopy[bookIndex] = updatedBook;

				// 親が見つかった場合、その nextBooks から現在の本を削除
				if (parentBook) {
					const parentIndex = booksCopy.findIndex(
						(book) => book.id === parentBook.id
					);
					booksCopy[parentIndex] = {
						...parentBook,
						nextBooks: parentBook.nextBooks.filter(
							(id) => id !== currentBook.id
						),
					};
				}
			}
			break;
		}
	}

	return booksCopy;
}

// 優先順位の高い本のみをフィルタリング
export function getHighPriorityBooks(books: Book[]): Book[] {
	return books.filter((book) => book.priority === "高");
}

// 展開状態を切り替え
export function toggleExpandState(
	expandedBooks: Record<string, boolean>,
	id: string
): Record<string, boolean> {
	return {
		...expandedBooks,
		[id]: !expandedBooks[id],
	};
}
