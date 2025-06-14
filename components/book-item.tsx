"use client";

import type { KeyboardEvent } from "react";
import type { Book } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronDown, Trash, Star, StarOff } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookItemProps {
	book: Book;
	books: Book[];
	expandedBooks: Record<string, boolean>;
	toggleExpand: (id: string) => void;
	togglePriority: (id: string) => void;
	deleteBook: (id: string) => void;
	setNextBook: (bookId: string, nextBookId: string) => void;
	onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void;
	isSelected: boolean;
	onSelect: () => void;
}

export default function BookItem({
	book,
	books,
	expandedBooks,
	toggleExpand,
	togglePriority,
	deleteBook,
	setNextBook,
	onKeyDown,
	isSelected,
	onSelect,
}: BookItemProps) {
	// この本の次に読む本のリスト
	const nextBooks = books.filter((b) => book.nextBooks.includes(b.id));

	// この本を次に読む本として設定している本のリスト
	const parentBooks = books.filter((b) => b.nextBooks.includes(book.id));

	// ネストレベルが1以上の場合は優先順位ボタンを無効化
	const canTogglePriority = book.level === 0;

	return (
		<div
			className={cn(
				"border rounded-md p-3 transition-all cursor-pointer",
				book.priority === "高" ? "border-l-4 border-l-orange-500" : "",
				book.level > 0 && "border-l-2 border-l-gray-300",
				isSelected && "ring-2 ring-blue-500 bg-blue-50"
			)}
			style={{
				marginLeft: `${book.level * 1.5}rem`,
				position: "relative",
			}}
			tabIndex={0}
			onKeyDown={onKeyDown}
			onClick={onSelect}
		>
			{book.level > 0 && (
				<div
					className="absolute w-4 h-4 border-l-2 border-b-2 border-gray-300 rounded-bl-md"
					style={{
						left: "-1rem",
						top: "-0.5rem",
						height: "1.5rem",
					}}
				/>
			)}
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-2 flex-grow">
					{canTogglePriority ? (
						<Button
							variant="ghost"
							size="sm"
							className="p-0 h-6 w-6"
							onClick={(e) => {
								e.stopPropagation();
								togglePriority(book.id);
							}}
						>
							{book.priority === "高" ? (
								<Star className="h-4 w-4 text-orange-500" />
							) : (
								<StarOff className="h-4 w-4 text-muted-foreground" />
							)}
							<span className="sr-only">優先順位を変更</span>
						</Button>
					) : (
						<div className="w-6 h-6 flex items-center justify-center">
							<StarOff className="h-4 w-4 text-gray-300" />
						</div>
					)}

					<span className="font-medium">{book.title}</span>
				</div>

				<div className="flex items-center space-x-1">
					{(nextBooks.length > 0 || parentBooks.length > 0) && (
						<Button
							variant="ghost"
							size="sm"
							className="h-8 w-8 p-0"
							onClick={(e) => {
								e.stopPropagation();
								toggleExpand(book.id);
							}}
						>
							{expandedBooks[book.id] ? (
								<ChevronDown className="h-4 w-4" />
							) : (
								<ChevronRight className="h-4 w-4" />
							)}
							<span className="sr-only">展開</span>
						</Button>
					)}

					<Button
						variant="ghost"
						size="sm"
						className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
						onClick={(e) => {
							e.stopPropagation();
							deleteBook(book.id);
						}}
					>
						<Trash className="h-4 w-4" />
						<span className="sr-only">削除</span>
					</Button>
				</div>
			</div>

			{expandedBooks[book.id] && (
				<div
					className="mt-2 pl-4 border-l-2 border-dashed border-muted-foreground/30"
					onClick={(e) => e.stopPropagation()}
				>
					{nextBooks.length > 0 && (
						<div className="mb-2">
							<h4 className="text-sm font-medium text-muted-foreground">
								次に読む本:
							</h4>
							<ul className="pl-4 space-y-1">
								{nextBooks.map((nextBook) => (
									<li key={nextBook.id} className="text-sm">
										{nextBook.title}
									</li>
								))}
							</ul>
						</div>
					)}

					{parentBooks.length > 0 && (
						<div>
							<h4 className="text-sm font-medium text-muted-foreground">
								この本の前に読む本:
							</h4>
							<ul className="pl-4 space-y-1">
								{parentBooks.map((parentBook) => (
									<li key={parentBook.id} className="text-sm">
										{parentBook.title}
									</li>
								))}
							</ul>
						</div>
					)}
				</div>
			)}
		</div>
	);
}
