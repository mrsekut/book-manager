import BookManager from "@/features/books/book-manager";

export default function Home() {
	return (
		<main className="container mx-auto p-4 max-w-4xl">
			<BookManager />
		</main>
	);
}
