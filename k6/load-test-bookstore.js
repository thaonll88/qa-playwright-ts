import http from "k6/http";
import { check, sleep } from "k6";
import { BASE_URL, BOOKSTORE_LOAD_OPTIONS } from "./config.js";

export const options = BOOKSTORE_LOAD_OPTIONS;

const HEADERS = { "Content-Type": "application/json" };

function getToken() {
  const res = http.post(
    `${BASE_URL}/Account/v1/GenerateToken`,
    JSON.stringify({
      userName: __ENV.K6_USERNAME,
      password: __ENV.K6_PASSWORD,
    }),
    { headers: HEADERS }
  );
  return JSON.parse(res.body).token;
}

export default function () {
  const token = getToken();
  if (!token) return; // skip if rate limited

  const authHeaders = {
    headers: {
      ...HEADERS,
      Authorization: `Bearer ${token}`,
    },
  };

  // GET all books
  const booksRes = http.get(`${BASE_URL}/BookStore/v1/Books`);
  const books = JSON.parse(booksRes.body).books;
  const isbn = books[0].isbn;

  check(booksRes, {
    "GET books status 200": (r) => r.status === 200,
    "books list not empty": (r) => books.length > 0,
  });

  // POST add book
  const addRes = http.post(
    `${BASE_URL}/BookStore/v1/Books`,
    JSON.stringify({
      userId: __ENV.K6_USER_ID,
      collectionOfIsbns: [{ isbn }],
    }),
    authHeaders
  );

  check(addRes, {
    "POST add book status 201": (r) => r.status === 201,
  });

  // DELETE all books
  http.del(
    `${BASE_URL}/BookStore/v1/Books?UserId=${__ENV.K6_USER_ID}`,
    null,
    authHeaders
  );

  sleep(1);
}