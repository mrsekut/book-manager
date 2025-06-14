import { atom } from "jotai";
import type { Book } from "@/features/books/types";
import { getHighPriorityBooks } from "@/features/books/bookLogic";

// 書籍リストのatom
export const booksAtom = atom<Book[]>([]);

// 選択中の本IDのatom
export const selectedBookIdAtom = atom<string | null>(null);

// 展開状態のatom
export const expandedBooksAtom = atom<Record<string, boolean>>({});

// タブ状態のatom
export const activeTabAtom = atom<string>("high-priority");

// 新規本タイトル入力用atom
export const newBookTitleAtom = atom<string>("");

// 計算済みatom: 優先順位の高い本のみ
export const highPriorityBooksAtom = atom((get) => {
	const books = get(booksAtom);
	return getHighPriorityBooks(books);
});
