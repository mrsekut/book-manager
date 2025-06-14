"use client"

import { useState, useEffect, type KeyboardEvent } from "react"
import type { Book, BookWithChildren } from "@/lib/types"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import BookItem from "@/components/book-item"

export default function BookManager() {
  const [books, setBooks] = useState<Book[]>([])
  const [newBookTitle, setNewBookTitle] = useState("")
  const [expandedBooks, setExpandedBooks] = useState<Record<string, boolean>>({})
  const [activeTab, setActiveTab] = useState<string>("high-priority")
  const [selectedBookId, setSelectedBookId] = useState<string | null>(null)

  // ローカルストレージからデータを読み込む
  useEffect(() => {
    const savedBooks = localStorage.getItem("books")
    if (savedBooks) {
      setBooks(JSON.parse(savedBooks))
    }
  }, [])

  // データをローカルストレージに保存
  useEffect(() => {
    localStorage.setItem("books", JSON.stringify(books))
  }, [books])

  // 本を追加
  const addBook = () => {
    if (newBookTitle.trim() === "") return

    const newBook: Book = {
      id: Date.now().toString(),
      title: newBookTitle,
      priority: "高", // デフォルトを「高」に変更
      nextBooks: [],
      level: 0, // デフォルトのネストレベル
    }

    // 新しい本を追加
    const updatedBooks = [...books, newBook]

    // 直前の本があり、それが新しい本の親になる可能性がある場合
    if (books.length > 0) {
      const lastBook = books[books.length - 1]

      // 直前の本と同じレベルで追加（デフォルト動作）
      // ただし、最大レベルは1まで
      newBook.level = Math.min(lastBook.level, 1)

      // ネストレベルが1の場合は優先順位を「未指定」にする
      if (newBook.level === 1) {
        newBook.priority = "未指定"
      }
    }

    setBooks(updatedBooks)
    setNewBookTitle("")

    // 新しく追加した本を選択状態にする
    setSelectedBookId(newBook.id)
  }

  // 本を削除
  const deleteBook = (id: string) => {
    // 削除する本を参照している本から参照を削除
    const updatedBooks = books.map((book) => ({
      ...book,
      nextBooks: book.nextBooks.filter((nextId) => nextId !== id),
    }))

    // 本自体を削除
    setBooks(updatedBooks.filter((book) => book.id !== id))

    // 選択中の本が削除された場合、選択をクリア
    if (selectedBookId === id) {
      setSelectedBookId(null)
    }
  }

  // 優先順位を変更
  const togglePriority = (id: string) => {
    setBooks(
      books.map((book) => {
        // ネストレベルが1以上の本は優先順位を変更できない
        if (book.id === id && book.level === 0) {
          return { ...book, priority: book.priority === "高" ? "未指定" : "高" }
        }
        return book
      }),
    )
  }

  // 次に読む本を設定
  const setNextBook = (bookId: string, nextBookId: string) => {
    setBooks(
      books.map((book) =>
        book.id === bookId
          ? {
              ...book,
              nextBooks: book.nextBooks.includes(nextBookId)
                ? book.nextBooks.filter((id) => id !== nextBookId)
                : [...book.nextBooks, nextBookId],
            }
          : book,
      ),
    )
  }

  // 本の展開状態を切り替え
  const toggleExpand = (id: string) => {
    setExpandedBooks({
      ...expandedBooks,
      [id]: !expandedBooks[id],
    })
  }

  // 同じレベルの前の本を見つける
  const findPreviousSiblingIndex = (books: Book[], currentIndex: number) => {
    const currentLevel = books[currentIndex].level

    for (let i = currentIndex - 1; i >= 0; i--) {
      if (books[i].level === currentLevel) {
        return i
      }
    }

    return -1 // 見つからなかった場合
  }

  // 同じレベルの次の本を見つける
  const findNextSiblingIndex = (books: Book[], currentIndex: number) => {
    const currentLevel = books[currentIndex].level

    for (let i = currentIndex + 1; i < books.length; i++) {
      if (books[i].level === currentLevel) {
        return i
      }
    }

    return -1 // 見つからなかった場合
  }

  // 本とその子孫をすべて取得する
  const getBookAndDescendants = (books: Book[], startIndex: number): number[] => {
    const result: number[] = [startIndex]
    const startBook = books[startIndex]
    const startLevel = startBook.level

    // startIndexの後にある本で、レベルがstartLevelより大きいものはすべて子孫
    let i = startIndex + 1
    while (i < books.length && books[i].level > startLevel) {
      result.push(i)
      i++
    }

    return result
  }

  // キーボードショートカット処理
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>, bookId: string, index: number) => {
    if (e.altKey) {
      e.preventDefault()

      const booksCopy = [...books]
      const bookIndex = booksCopy.findIndex((b) => b.id === bookId)
      const currentBook = booksCopy[bookIndex]

      if (e.key === "ArrowUp") {
        // 同じレベルの前の本を探す
        const prevSiblingIndex = findPreviousSiblingIndex(booksCopy, bookIndex)

        if (prevSiblingIndex !== -1) {
          // 現在の本とその子孫のインデックスを取得
          const currentAndDescendants = getBookAndDescendants(booksCopy, bookIndex)

          // 前の兄弟とその子孫のインデックスを取得
          const prevAndDescendants = getBookAndDescendants(booksCopy, prevSiblingIndex)

          // 移動する本とその子孫を抽出
          const itemsToMove = currentAndDescendants.map((idx) => booksCopy[idx])

          // 移動する本とその子孫を元の配列から削除（インデックスの大きい順に削除）
          currentAndDescendants
            .sort((a, b) => b - a)
            .forEach((idx) => {
              booksCopy.splice(idx, 1)
            })

          // 前の兄弟の位置に挿入
          booksCopy.splice(prevSiblingIndex, 0, ...itemsToMove)

          setBooks(booksCopy)
        }
      } else if (e.key === "ArrowDown") {
        // 同じレベルの次の本を探す
        const nextSiblingIndex = findNextSiblingIndex(booksCopy, bookIndex)

        if (nextSiblingIndex !== -1) {
          // 現在の本とその子孫のインデックスを取得
          const currentAndDescendants = getBookAndDescendants(booksCopy, bookIndex)

          // 次の兄弟とその子孫のインデックスを取得
          const nextAndDescendants = getBookAndDescendants(booksCopy, nextSiblingIndex)

          // 次の兄弟の最後の子孫のインデックス
          const insertPosition = nextAndDescendants[nextAndDescendants.length - 1]

          // 移動する本とその子孫を抽出
          const itemsToMove = currentAndDescendants.map((idx) => booksCopy[idx])

          // 移動する本とその子孫を元の配列から削除（インデックスの大きい順に削除）
          currentAndDescendants
            .sort((a, b) => b - a)
            .forEach((idx) => {
              booksCopy.splice(idx, 1)
            })

          // 次の兄弟の子孫の後に挿入
          booksCopy.splice(insertPosition + 1 - currentAndDescendants.length, 0, ...itemsToMove)

          setBooks(booksCopy)
        }
      } else if (e.key === "ArrowRight" && bookIndex > 0) {
        // 右に移動（ネストレベルを上げる）
        // 直前の本を親として設定
        const parentIndex = bookIndex - 1
        const parentBook = booksCopy[parentIndex]

        // 現在の本のレベルを親より1つ深くする（最大で1まで）
        const newLevel = Math.min(parentBook.level + 1, 1)

        // 現在の本を更新
        const updatedBook = {
          ...currentBook,
          level: newLevel,
          // ネストレベルが1になる場合は優先順位を「未指定」にする
          priority: newLevel === 1 ? "未指定" : currentBook.priority,
        }
        booksCopy[bookIndex] = updatedBook

        // 親の本の nextBooks に現在の本を追加（まだ含まれていない場合）
        if (!parentBook.nextBooks.includes(currentBook.id)) {
          booksCopy[parentIndex] = {
            ...parentBook,
            nextBooks: [...parentBook.nextBooks, currentBook.id],
          }
        }

        setBooks(booksCopy)
      } else if (e.key === "ArrowLeft" && currentBook.level > 0) {
        // 左に移動（ネストレベルを下げる）
        // 現在の親を見つける
        const parentBook = booksCopy.find((book) => book.nextBooks.includes(currentBook.id))

        // 現在の本のレベルを1つ浅くする
        const newLevel = currentBook.level - 1
        const updatedBook = {
          ...currentBook,
          level: newLevel,
          // ネストレベルが0になる場合は優先順位を変更可能にする（ただしデフォルトは「未指定」のまま）
        }
        booksCopy[bookIndex] = updatedBook

        // 親が見つかった場合、その nextBooks から現在の本を削除
        if (parentBook) {
          const parentIndex = booksCopy.findIndex((book) => book.id === parentBook.id)
          booksCopy[parentIndex] = {
            ...parentBook,
            nextBooks: parentBook.nextBooks.filter((id) => id !== currentBook.id),
          }
        }

        setBooks(booksCopy)
      }
    }
  }

  // 本を選択
  const handleSelectBook = (id: string) => {
    setSelectedBookId(id === selectedBookId ? null : id)
  }

  // 優先順位の高い本のみをフィルタリング
  const highPriorityBooks = books.filter((book) => book.priority === "高")

  // 本と次に読む本の階層構造を構築
  const buildBookHierarchy = (books: Book[]): BookWithChildren[] => {
    const booksMap = new Map<string, BookWithChildren>()

    // まず全ての本をマップに追加
    books.forEach((book) => {
      booksMap.set(book.id, { ...book, children: [] })
    })

    // 次に読む本の関係を構築
    books.forEach((book) => {
      book.nextBooks.forEach((nextBookId) => {
        const parentBook = booksMap.get(book.id)
        const childBook = booksMap.get(nextBookId)
        if (parentBook && childBook) {
          parentBook.children.push(childBook)
        }
      })
    })

    return Array.from(booksMap.values())
  }

  const bookHierarchy = buildBookHierarchy(activeTab === "high-priority" ? highPriorityBooks : books)

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Input
          type="text"
          placeholder="本のタイトルを入力"
          value={newBookTitle}
          onChange={(e) => setNewBookTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") addBook()
          }}
          className="flex-grow"
        />
        <Button onClick={addBook}>追加</Button>
      </div>

      <Tabs defaultValue="high-priority" onValueChange={setActiveTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="high-priority">優先順位高</TabsTrigger>
          <TabsTrigger value="all">すべての本</TabsTrigger>
        </TabsList>

        <TabsContent value="high-priority" className="space-y-2">
          {highPriorityBooks.length === 0 ? (
            <p className="text-muted-foreground">優先順位の高い本はありません</p>
          ) : (
            highPriorityBooks.map((book, index) => (
              <BookItem
                key={book.id}
                book={book}
                books={books}
                expandedBooks={expandedBooks}
                toggleExpand={toggleExpand}
                togglePriority={togglePriority}
                deleteBook={deleteBook}
                setNextBook={setNextBook}
                onKeyDown={(e) => handleKeyDown(e, book.id, index)}
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
            books.map((book, index) => (
              <BookItem
                key={book.id}
                book={book}
                books={books}
                expandedBooks={expandedBooks}
                toggleExpand={toggleExpand}
                togglePriority={togglePriority}
                deleteBook={deleteBook}
                setNextBook={setNextBook}
                onKeyDown={(e) => handleKeyDown(e, book.id, index)}
                isSelected={selectedBookId === book.id}
                onSelect={() => handleSelectBook(book.id)}
              />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
