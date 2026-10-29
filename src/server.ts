import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { JsonStore } from "./store.js";
import { renderShelfPage } from "./shelf.js";

const here = dirname(fileURLToPath(import.meta.url));
const dataFile = process.env.BOOK_SWAP_DATA ?? join(here, "..", "data", "books.json");
const store = new JsonStore(dataFile);
const port = Number(process.env.PORT ?? 3000);

async function readForm(req: IncomingMessage): Promise<Record<string, string>> {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(chunk as Buffer);
  }
  const body = Buffer.concat(chunks).toString("utf8");
  const params = new URLSearchParams(body);
  const fields: Record<string, string> = {};
  for (const [key, value] of params) {
    fields[key] = value;
  }
  return fields;
}

function send(res: ServerResponse, status: number, body: string): void {
  res.writeHead(status, { "content-type": "text/html; charset=utf-8" });
  res.end(body);
}

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url ?? "/", `http://localhost:${port}`);

    if (req.method === "GET" && url.pathname === "/") {
      const books = await store.listBooks();
      send(res, 200, renderShelfPage(books));
      return;
    }

    if (req.method === "POST" && url.pathname === "/books") {
      const fields = await readForm(req);
      const title = (fields.title ?? "").trim();
      const author = (fields.author ?? "").trim();
      const owner = (fields.owner ?? "").trim();
      if (!title || !author || !owner) {
        send(res, 400, renderShelfPage(await store.listBooks()));
        return;
      }
      await store.addBook({ title, author, owner });
      res.writeHead(303, { location: "/" });
      res.end();
      return;
    }

    send(res, 404, "<!doctype html><title>Not found</title><p>Not found</p>");
  } catch (error) {
    console.error(error);
    send(res, 500, "<!doctype html><title>Error</title><p>Something went wrong.</p>");
  }
});

server.listen(port, () => {
  console.log(`Office Book Swap listening on http://localhost:${port}`);
});
