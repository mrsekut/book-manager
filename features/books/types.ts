export interface Book {
	id: string;
	title: string;
	priority: "高" | "未指定";
	nextBooks: string[]; // 次に読む本のID
	level: number; // ネストレベル（インデント）
	notes?: string; // メモ
	links?: string[]; // 関連リンク
}

export interface BookWithChildren extends Book {
	children: BookWithChildren[];
}
