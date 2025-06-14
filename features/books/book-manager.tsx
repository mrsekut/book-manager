"use client";

import { useBookManager } from "@/features/books/useBookManager";
import BookItem from "@/features/books/book-item";
import { Input } from "@/components/input";
import { Button } from "@/components/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/tabs";

export default function BookManager() {
	const {
		books,
		newBookTitle,
		setNewBookTitle,
		expandedBooks,
		toggleExpand,
		togglePriority,
		deleteBook,
		handleKeyDown,
		selectedBookId,
		handleSelectBook,
		activeTab,
		setActiveTab,
		addBook,
		highPriorityBooks,
		updateBookNotes,
		addBookLink,
		removeBookLink,
	} = useBookManager();

	return (
		<div className="space-y-6">
			<div className="flex items-center space-x-2">
				<Input
					type="text"
					placeholder="本のタイトルを入力"
					value={newBookTitle}
					onChange={(e) => setNewBookTitle(e.target.value)}
					onKeyDown={(e) => {
						if (e.key === "Enter") addBook();
					}}
					className="flex-grow"
				/>
				<Button onClick={addBook}>追加</Button>
			</div>

			<Tabs
				defaultValue="high-priority"
				value={activeTab}
				onValueChange={setActiveTab}
			>
				<TabsList className="mb-4">
					<TabsTrigger value="high-priority">優先順位高</TabsTrigger>
					<TabsTrigger value="all">すべての本</TabsTrigger>
				</TabsList>

				<TabsContent value="high-priority" className="space-y-2">
					{highPriorityBooks.length === 0 ? (
						<p className="text-muted-foreground">
							優先順位の高い本はありません
						</p>
					) : (
						highPriorityBooks.map((book) => (
							<BookItem
								key={book.id}
								book={book}
								expandedBooks={expandedBooks}
								toggleExpand={toggleExpand}
								togglePriority={togglePriority}
								deleteBook={deleteBook}
								updateBookNotes={updateBookNotes}
								addBookLink={addBookLink}
								removeBookLink={removeBookLink}
								onKeyDown={(e) => handleKeyDown(e, book.id)}
								isSelected={selectedBookId === book.id}
								onSelect={() => handleSelectBook(book.id)}
							/>
						))
					)}
				</TabsContent>

				<TabsContent value="all" className="space-y-2">
					{books.length === 0 ? (
						<p className="text-muted-foreground">本が登録されていません</p>
					) : (
						books.map((book) => (
							<BookItem
								key={book.id}
								book={book}
								expandedBooks={expandedBooks}
								toggleExpand={toggleExpand}
								togglePriority={togglePriority}
								deleteBook={deleteBook}
								updateBookNotes={updateBookNotes}
								addBookLink={addBookLink}
								removeBookLink={removeBookLink}
								onKeyDown={(e) => handleKeyDown(e, book.id)}
								isSelected={selectedBookId === book.id}
								onSelect={() => handleSelectBook(book.id)}
							/>
						))
					)}
				</TabsContent>
			</Tabs>
		</div>
	);
}
