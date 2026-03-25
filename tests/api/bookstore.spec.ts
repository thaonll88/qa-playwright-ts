import { test, expect } from "@playwright/test";
import { ApiHelper } from "@helpers/api.helper";
import { TEST_ACCOUNT } from "@helpers/test-data.helper";
import {
  AllBooksResponse,
  ErrorResponse,
  GetBookResponse,
  GetUserResponse,
  ReplaceBookResponse,
  TokenResponse,
} from "@appTypes/api.types";

let firstIsbn: string = "";
let secondIsbn: string = "";
let userId: string = "";
let token: string = "";

test.describe.configure({ mode: "serial" }); // Run tests in this block sequentially to maintain state

test.describe("Bookstore API", () => {
  test.beforeAll(async ({ request }) => {
    const api = new ApiHelper(request);

    // ISBN from bookstore
    const booksRes = await api.getAllBooks();
    const booksBody = (await booksRes.json()) as AllBooksResponse;
    firstIsbn = booksBody.books[0].isbn;
    secondIsbn = booksBody.books[1].isbn;

    // token from TEST_ACCOUNT
    const tokenRes = await api.generateToken(TEST_ACCOUNT);
    const tokenBody = (await tokenRes.json()) as TokenResponse;
    token = tokenBody.token;

    expect(tokenBody.token).toBeDefined();

    // userId from TEST_ACCOUNT
    userId = TEST_ACCOUNT.userID;
  });

  test("GET /books - get all books", async ({ request }) => {
    const api = new ApiHelper(request);
    const res = await api.getAllBooks();
    const body = (await res.json()) as AllBooksResponse;

    expect(res.status()).toBe(200);
    expect(body.books[0].isbn).toBeDefined();
    expect(body.books[0].title).toBeDefined();
    expect(body.books[0].author).toBeDefined();
    expect(body.books[0].pages).toBeGreaterThan(0);
  });

  test("GET /book - get book by ISBN", async ({ request }) => {
    const api = new ApiHelper(request);
    const res = await api.getBook(firstIsbn);
    const body = (await res.json()) as GetBookResponse;

    expect(res.status()).toBe(200);
    expect(body).toBeDefined();
    expect(body.isbn).toBe(firstIsbn);
    expect(body.title).toBeDefined();
    expect(body.author).toBeDefined();
    expect(body.pages).toBeGreaterThan(0);
  });

  test("POST /books - add book successfully", async ({ request }) => {
    const api = new ApiHelper(request);

    // Clean first
    await api.deleteAllBooks(userId, token);

    // then add a new book
    const res = await api.addBooks(
      {
        userId,
        collectionOfIsbns: [{ isbn: firstIsbn }],
      },
      token,
    );
    const body = (await res.json()) as AllBooksResponse;

    expect(res.status()).toBe(201);
    expect(body.books[0].isbn).toBe(firstIsbn);
  });

  test("POST /books - add book duplicated", async ({ request }) => {
    const api = new ApiHelper(request);

    // Clean first
    await api.deleteAllBooks(userId, token);

    // then add a new book
    await api.addBooks(
      {
        userId,
        collectionOfIsbns: [{ isbn: firstIsbn }],
      },
      token,
    );

    // Add the same book
    const res = await api.addBooks(
      {
        userId,
        collectionOfIsbns: [{ isbn: firstIsbn }],
      },
      token,
    );
    const body = (await res.json()) as ErrorResponse;

    expect(res.status()).toBe(400);
    expect(body.message).toBe("ISBN already present in the User's Collection!");
  });

  test("PUT /books/{ISBN}", async ({ request }) => {
    const api = new ApiHelper(request);

    // clean first
    await api.deleteAllBooks(userId, token);

    // Add first book
    await api.addBooks(
      {
        userId,
        collectionOfIsbns: [{ isbn: firstIsbn }],
      },
      token,
    );

    // Replace with the second book
    const res = await api.replaceBook(
      firstIsbn,
      {
        userId,
        isbn: secondIsbn,
      },
      token,
    );
    const body = (await res.json()) as ReplaceBookResponse;

    expect(res.status()).toBe(200);
    expect(body.books[0].isbn).toBe(secondIsbn);
    expect(body.books[0].title).toBeDefined();
    expect(body.books[0].author).toBeDefined();
    expect(body.books[0].pages).toBeGreaterThan(0);
  });

  test("DELETE /book - delete book successfully", async ({ request }) => {
    const api = new ApiHelper(request);

    // Clean first
    await api.deleteAllBooks(userId, token);

    // then add a new book
    const res = await api.addBooks(
      {
        userId,
        collectionOfIsbns: [{ isbn: firstIsbn }],
      },
      token,
    );
    const body = (await res.json()) as AllBooksResponse;

    expect(res.status()).toBe(201);
    expect(body.books[0].isbn).toBe(firstIsbn);

    // Delete the book
    const deleteRes = await api.deleteBook({ isbn: firstIsbn, userId }, token);

    expect(deleteRes.status()).toBe(204);

    // Verify the book is deleted
    const userRes = await api.getUser(userId, token);
    const userBody = (await userRes.json()) as GetUserResponse;

    expect(userBody.books).toEqual([]);
  });

  test("DELETE /books - delete books successfully", async ({ request }) => {
    const api = new ApiHelper(request);

    // Clean first
    await api.deleteAllBooks(userId, token);

    // then add first book
    await api.addBooks(
      {
        userId,
        collectionOfIsbns: [{ isbn: firstIsbn }],
      },
      token,
    );

    // add second book
    await api.addBooks(
      {
        userId,
        collectionOfIsbns: [{ isbn: secondIsbn }],
      },
      token,
    );

    // Delete the books
    const deleteRes = await api.deleteAllBooks(userId, token);

    expect(deleteRes.status()).toBe(204);

    // Verify the book is deleted
    const userRes = await api.getUser(userId, token);
    const userBody = (await userRes.json()) as GetUserResponse;

    expect(userBody.books).toEqual([]);
  });

  test("POST /books - add book without token", async ({ request }) => {
    const api = new ApiHelper(request);

    const res = await api.addBooks(
      {
        userId,
        collectionOfIsbns: [{ isbn: firstIsbn }],
      },
      "invalidtoken", // ← invalid token
    );

    expect(res.status()).toBe(401);
  });
});
