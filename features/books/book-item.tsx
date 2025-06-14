"use client";

import type { KeyboardEvent } from "react";
import type { Book } from "@/features/books/types";
import { Button } from "@/components/button";
import { Textarea } from "@/components/textarea";
import { Input } from "@/components/input";
import {
	ChevronRight,
	ChevronDown,
	Trash,
	Star,
	StarOff,
	Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

type Props = {
	book: Book;
	expandedBooks: Record<string, boolean>;
	toggleExpand: (id: string) => void;
	togglePriority: (id: string) => void;
	deleteBook: (id: string) => void;
	updateBookNotes: (id: string, notes: string) => void;
	addBookLink: (id: string, link: string) => void;
	removeBookLink: (id: string, linkIndex: number) => void;
	onKeyDown: (e: KeyboardEvent<HTMLDivElement>) => void;
	isSelected: boolean;
	onSelect: () => void;
};

export default function BookItem({
	book,
	expandedBooks,
	toggleExpand,
	togglePriority,
	deleteBook,
	updateBookNotes,
	addBookLink,
	removeBookLink,
	onKeyDown,
	isSelected,
	onSelect,
}: Props) {
	const [newLink, setNewLink] = useState("");

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
				<div className="mt-3 space-y-3" onClick={(e) => e.stopPropagation()}>
					<div>
						<label className="text-sm font-medium text-muted-foreground">
							メモ
						</label>
						<Textarea
							value={book.notes || ""}
							onChange={(e) => updateBookNotes(book.id, e.target.value)}
							placeholder="この本に関するメモを入力..."
							className="mt-1 resize-none"
							rows={3}
						/>
					</div>

					<div>
						<label className="text-sm font-medium text-muted-foreground">
							関連リンク
						</label>
						<div className="mt-1 space-y-2">
							{book.links?.map((link, index) => (
								<div key={index} className="flex items-center gap-2">
									<a
										href={link}
										target="_blank"
										rel="noopener noreferrer"
										className="text-sm text-blue-600 hover:underline flex-1 truncate"
									>
										{link}
									</a>
									<Button
										variant="ghost"
										size="sm"
										className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
										onClick={() => removeBookLink(book.id, index)}
									>
										<Trash className="h-3 w-3" />
									</Button>
								</div>
							))}
							<div className="flex gap-2">
								<Input
									value={newLink}
									onChange={(e) => setNewLink(e.target.value)}
									placeholder="https://..."
									onKeyPress={(e) => {
										if (e.key === "Enter" && newLink.trim()) {
											addBookLink(book.id, newLink.trim());
											setNewLink("");
										}
									}}
								/>
								<Button
									variant="ghost"
									size="sm"
									className="h-9 w-9 p-0"
									onClick={() => {
										if (newLink.trim()) {
											addBookLink(book.id, newLink.trim());
											setNewLink("");
										}
									}}
								>
									<Plus className="h-4 w-4" />
								</Button>
							</div>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
