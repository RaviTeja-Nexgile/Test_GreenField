import type { Book } from "./store.js";

const AMP = String.fromCharCode(38);
const LT = String.fromCharCode(60);
const GT = String.fromCharCode(62);
const QUOT = String.fromCharCode(34);
const APOS = String.fromCharCode(39);

/** Escape text for safe insertion into HTML. */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, `${AMP}amp;`)
    .replace(/</g, `${LT}lt;`)
    .replace(/>/g, `${GT}gt;`)
    .replace(/"/g, `${AMP}quot;`)
    .replace(/'/g, `${AMP}#39;`);
}

/** Render one book as a shelf card. */
export function renderBook(book: Book): string {
  const status = book.borrowedBy
    ? `Borrowed by ${escapeHtml(book.borrowedBy)}`
    : "Available";
  return [
    `<li class="book" data-book-id="${escapeHtml(book.id)}">`,
    `  <h2 class="book-title">${escapeHtml(book.title)}</h2>`,
    `  <p class="book-author">${escapeHtml(book.author)}</p>`,
    `  <p class="book-owner">Lent by ${escapeHtml(book.owner)}</p>`,
    `  <p class="book-status">${status}</p>`,
    `</li>`,
  ].join("\n");
}

/** Render the shelf page: the list of books plus the add-book form. */
export function renderShelfPage(books: Book[]): string {
  const list =
    books.length === 0
      ? `<p class="empty">The shelf is empty. Add the first book.</p>`
      : `<ul class="shelf">\n${books.map(renderBook).join("\n")}\n</ul>`;

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Office Book Swap</title>
</head>
<body>
  <main>
    <h1>Office Book Swap</h1>
    <section class="shelf-section">
      ${list}
    </section>
    <section class="add-book">
      <h2>Add a book</h2>
      <form method="post" action="/books">
        <label>Title <input name="title" required></label>
        <label>Author <input name="author" required></label>
        <label>Your name <input name="owner" required></label>
        <button type="submit">Add to shelf</button>
      </form>
    </section>
  </main>
</body>
</html>
`;
}
