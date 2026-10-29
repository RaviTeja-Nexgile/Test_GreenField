import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname } from "node:path";

/** A book a colleague has put on the shelf. */
export interface Book {
  id: string;
  title: string;
  author: string;
  owner: string;
  borrowedBy: string | null;
  borrowedAt: string | null;
}

/** The whole persisted state of the app. */
export interface StoreData {
  books: Book[];
}

const EMPTY: StoreData = { books: [] };

/**
 * A tiny JSON-file store. Every read goes to disk so that several processes
 * (the server and the tests) see each other's writes.
 */
export class JsonStore {
  private readonly filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  async read(): Promise<StoreData> {
    try {
      const raw = await readFile(this.filePath, "utf8");
      const parsed = JSON.parse(raw) as Partial<StoreData>;
      return { books: Array.isArray(parsed.books) ? parsed.books : [] };
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return { ...EMPTY, books: [] };
      }
      throw error;
    }
  }

  async write(data: StoreData): Promise<void> {
    await mkdir(dirname(this.filePath), { recursive: true });
    await writeFile(this.filePath, JSON.stringify(data, null, 2), "utf8");
  }

  /** All books currently on the shelf. */
  async listBooks(): Promise<Book[]> {
    const data = await this.read();
    return data.books;
  }

  /** Add a book to the shelf and return the stored record. */
  async addBook(input: { title: string; author: string; owner: string }): Promise<Book> {
    const data = await this.read();
    const book: Book = {
      id: nextId(data.books),
      title: input.title,
      author: input.author,
      owner: input.owner,
      borrowedBy: null,
      borrowedAt: null,
    };
    data.books.push(book);
    await this.write(data);
    return book;
  }
}

function nextId(books: Book[]): string {
  let max = 0;
  for (const book of books) {
    const numeric = Number.parseInt(book.id, 10);
    if (Number.isFinite(numeric) && numeric > max) {
      max = numeric;
    }
  }
  return String(max + 1);
}
