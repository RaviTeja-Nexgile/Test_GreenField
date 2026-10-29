import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { JsonStore } from "../src/store.ts";
import { renderShelfPage } from "../src/shelf.ts";

async function withStore(run: (store: JsonStore) => Promise<void>): Promise<void> {
  const dir = await mkdtemp(join(tmpdir(), "book-swap-"));
  try {
    await run(new JsonStore(join(dir, "books.json")));
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test("a new store has an empty shelf", async () => {
  await withStore(async (store) => {
    assert.deepEqual(await store.listBooks(), []);
  });
});

test("an added book is shown on the shelf", async () => {
  await withStore(async (store) => {
    const book = await store.addBook({
      title: "The Pragmatic Programmer",
      author: "Hunt & Thomas",
      owner: "Ada",
    });

    const books = await store.listBooks();
    assert.equal(books.length, 1);
    assert.equal(books[0].id, book.id);
    assert.equal(books[0].title, "The Pragmatic Programmer");

    const html = renderShelfPage(books);
    const amp = String.fromCharCode(38);
    assert.match(html, /The Pragmatic Programmer/);
    assert.ok(html.includes(`Hunt ${amp}amp; Thomas`));
    assert.match(html, /Lent by Ada/);
    assert.match(html, /Available/);
  });
});

test("the empty shelf says so", () => {
  const html = renderShelfPage([]);
  assert.match(html, /The shelf is empty/);
  assert.match(html, /<form method="post" action="\/books">/);
});
