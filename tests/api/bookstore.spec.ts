import { test, expect } from "@playwright/test";
import { ApiHelper } from "@helpers/api.helper";
import { TEST_ACCOUNT } from "@helpers/test-data.helper";
import {
  AllBooksResponse,
  AuthorizedResponse,
  ErrorResponse,
  GetUserResponse,
  TokenResponse,
} from "@appTypes/api.types";

let firstIsbn: string = "";
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

    // token from TEST_ACCOUNT
    const tokenRes = await api.generateToken(TEST_ACCOUNT);
    const tokenBody = (await tokenRes.json()) as TokenResponse;
    token = tokenBody.token;

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
});
