// ===== REQUEST TYPES =====

export interface LoginRequest {
  userName: string;
  password: string;
}

export interface RegisterRequest {
  userName: string;
  password: string;
}

export interface AddBooksRequest {
  userID: string;
  collectionOfIsbns: CollectionOfIsbn[];
}

export interface DeleteBookRequest {
  isbn: string;
  userID: string;
}

export interface ReplaceIsbnRequest {
  userID: string;
  isbn: string;
}

// ===== RESPONSE TYPES =====

// POST /Account/v1/Authorized
export type AuthorizedResponse = boolean;

// POST /Account/v1/GenerateToken
export interface TokenResponse {
  token: string;
  expires: string;
  status: string;
  result: string;
}

// POST /Account/v1/User
export interface RegisterResponse {
  userID: string;
  username: string;
  books: Book[];
}

// POST /User response
export interface RegisterResponse {
  userID: string; // ← D hoa
  username: string;
  books: Book[];
}

// GET /User response
export interface GetUserResponse {
  userId: string; // ← d thường
  username: string;
  books: Book[];
}

// DELETE /Account/v1/User/{UUID}
export interface DeleteUserResponse {
  code: number;
  message: string;
}

// GET /BookStore/v1/Books
export interface AllBooksResponse {
  books: Book[];
}

// POST /BookStore/v1/Books
export interface AddBooksResponse {
  isbn: string;
}

// DELETE /BookStore/v1/Books
export interface DeleteAllBooksResponse {
  userID: string;
  message: string;
}

// GET /BookStore/v1/Book
export interface GetBookResponse {
  isbn: string;
  title: string;
  subTitle: string;
  author: string;
  publish_date: string;
  publisher: string;
  pages: number;
  description: string;
  website: string;
}

// DELETE /BookStore/v1/Book
export interface DeleteBookResponse {
  userID: string;
  isbn: string;
  message: string;
}

// PUT /BookStore/v1/Books/{ISBN}
export interface ReplaceBookResponse {
  userID: string;
  username: string;
  books: Book[];
}

// ===== SHARED TYPES =====

export interface Book {
  isbn: string;
  title: string;
  subTitle: string;
  author: string;
  publish_date: string;
  publisher: string;
  pages: number;
  description: string;
  website: string;
}

export interface CollectionOfIsbn {
  isbn: string;
}

// Dùng chung cho mọi error response
export interface ErrorResponse {
  code: number;
  message: string;
}
