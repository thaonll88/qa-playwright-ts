import { APIRequestContext } from "@playwright/test";
import * as dotenv from "dotenv";
import {
  LoginRequest,
  RegisterRequest,
  AddBooksRequest,
  DeleteBookRequest,
  ReplaceIsbnRequest,
} from "@appTypes/api.types";
dotenv.config();

export class ApiHelper {
  constructor(private request: APIRequestContext) {}

  async registerUser(data: RegisterRequest) {
    return await this.request.post("/Account/v1/User", { data });
  }

  async generateToken(data: LoginRequest) {
    return await this.request.post("/Account/v1/GenerateToken", { data });
  }

  async isAuthorized(data: LoginRequest) {
    return await this.request.post("/Account/v1/Authorized", { data });
  }

  async getUser(userId: string, token: string) {
    return await this.request.get(`/Account/v1/User/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async deleteUser(userId: string, token: string) {
    return await this.request.delete(`/Account/v1/User/${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async getAllBooks() {
    return await this.request.get("/BookStore/v1/Books");
  }

  async getBook(isbn: string) {
    return await this.request.get(`/BookStore/v1/Book?ISBN=${isbn}`);
  }

  async addBooks(data: AddBooksRequest, token: string) {
    return await this.request.post("/BookStore/v1/Books", {
      headers: { Authorization: `Bearer ${token}` },
      data,
    });
  }

  async deleteAllBooks(userId: string, token: string) {
    return await this.request.delete(`/BookStore/v1/Books?UserId=${userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  }

  async deleteBook(data: DeleteBookRequest, token: string) {
    return await this.request.delete("/BookStore/v1/Book", {
      headers: { Authorization: `Bearer ${token}` },
      data,
    });
  }

  async replaceBook(isbn: string, data: ReplaceIsbnRequest, token: string) {
    return await this.request.put(`/BookStore/v1/Books/${isbn}`, {
      headers: { Authorization: `Bearer ${token}` },
      data,
    });
  }
}
