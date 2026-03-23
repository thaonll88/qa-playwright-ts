import { test, expect } from "@playwright/test";
import { ApiHelper } from "@helpers/api.helper";
import {
  AuthorizedResponse,
  ErrorResponse,
  GetUserResponse,
  RegisterResponse,
  TokenResponse,
} from "@appTypes/api.types";
import { generateUser, TEST_ACCOUNT } from "@helpers/test-data.helper";

test.describe("Account API", () => {
  test("POST /User - create user successfully", async ({ request }) => {
    const api = new ApiHelper(request);
    const user = generateUser();

    const res = await api.registerUser(user);
    const body = (await res.json()) as RegisterResponse;

    expect(res.status()).toBe(201);
    expect(body.userID).toBeDefined();
    expect(body.username).toBe(user.userName);
    expect(body.books).toEqual([]);
  });

  test("POST /User - create user with existing username", async ({
    request,
  }) => {
    const api = new ApiHelper(request);

    // Try to register the existing user
    const res = await api.registerUser(TEST_ACCOUNT);
    const body = (await res.json()) as ErrorResponse;

    expect(res.status()).toBe(406);
    expect(body.message).toBe("User exists!");
  });

  test("POST /User - create user with weak password", async ({ request }) => {
    const api = new ApiHelper(request);
    const user = generateUser();

    // Try to register the user with a weak password
    const res = await api.registerUser({ ...user, password: "123" });
    const body = (await res.json()) as ErrorResponse;

    expect(res.status()).toBe(400);
    expect(body.message).toBe(
      "Passwords must have at least one non alphanumeric character, one digit ('0'-'9'), one uppercase ('A'-'Z'), one lowercase ('a'-'z'), one special character and Password must be eight characters or longer.",
    );
  });

  test("POST /Authorized - authorized successfully", async ({ request }) => {
    const api = new ApiHelper(request);
    const res = await api.isAuthorized(TEST_ACCOUNT);
    const body = (await res.json()) as AuthorizedResponse;

    expect(res.status()).toBe(200);
    expect(body).toBe(true);
  });

  test("POST /Authorized - wrong password", async ({ request }) => {
    const api = new ApiHelper(request);
    const res = await api.isAuthorized({
      ...TEST_ACCOUNT,
      password: "wrong-password",
    });
    const body = (await res.json()) as ErrorResponse;

    expect(res.status()).toBe(404);
    expect(body.message).toBe("User not found!");
  });

  test("POST /GenerateToken - generate token successfully", async ({
    request,
  }) => {
    const api = new ApiHelper(request);
    const res = await api.generateToken(TEST_ACCOUNT);
    const body = (await res.json()) as TokenResponse;

    expect(res.status()).toBe(200);
    expect(body.token).toBeDefined();
    expect(body.expires).toBeDefined();
    expect(body.status).toBe("Success");
    expect(body.result).toBe("User authorized successfully.");
  });

  test("POST /GenerateToken - wrong password", async ({ request }) => {
    const api = new ApiHelper(request);
    const res = await api.generateToken({
      ...TEST_ACCOUNT,
      password: "wrong-password",
    });
    const body = (await res.json()) as TokenResponse;

    expect(res.status()).toBe(200);
    expect(body.token).toBe(null);
    expect(body.expires).toBe(null);
    expect(body.status).toBe("Failed");
    expect(body.result).toBe("User authorization failed.");
  });

  test("POST /GenerateToken - wrong username", async ({ request }) => {
    const api = new ApiHelper(request);
    const res = await api.generateToken({
      ...TEST_ACCOUNT,
      userName: "wrong-userName",
    });
    const body = (await res.json()) as TokenResponse;

    expect(res.status()).toBe(200);
    expect(body.token).toBe(null);
    expect(body.expires).toBe(null);
    expect(body.status).toBe("Failed");
    expect(body.result).toBe("User authorization failed.");
  });

  test("GET /User/{UUID} - get user successfully", async ({ request }) => {
    const api = new ApiHelper(request);

    // Create a new user
    const newUser = generateUser();
    const registerRes = await api.registerUser(newUser);
    const registerBody = (await registerRes.json()) as RegisterResponse;

    // Generate token by using the new user
    const tokenRes = await api.generateToken(newUser); // ← newUser, not TEST_ACCOUNT
    const tokenBody = (await tokenRes.json()) as TokenResponse;

    // Get user by token of new user
    const res = await api.getUser(registerBody.userID, tokenBody.token);
    const body = (await res.json()) as GetUserResponse;

    expect(res.status()).toBe(200);
    expect(body.userId).toBe(registerBody.userID);
    expect(body.username).toBe(newUser.userName);
  });

  test("GET /User/{UUID} - user not found", async ({ request }) => {
    const api = new ApiHelper(request);
    const res = await api.getUser("invalid-uuid", "invalid-token");
    const body = (await res.json()) as ErrorResponse;

    expect(res.status()).toBe(401);
    expect(body.message).toBe("User not found!");
  });

  test("DELETE /User/{UUID} - delete user successfully", async ({
    request,
  }) => {
    const api = new ApiHelper(request);

    // Create a new user
    const newUser = generateUser();
    const registerRes = await api.registerUser(newUser);
    const registerBody = (await registerRes.json()) as RegisterResponse;

    // Generate token by using the new user
    const tokenRes = await api.generateToken(newUser); // ← newUser, not TEST_ACCOUNT
    const tokenBody = (await tokenRes.json()) as TokenResponse;

    // Delete user by using the new user's ID and token
    const res = await api.deleteUser(registerBody.userID, tokenBody.token);

    console.log("DELETE STATUS:", res.status());

    expect(res.status()).toBe(204);
  });

  test("DELETE /User/{UUID} - delete user with invalid token", async ({
    request,
  }) => {
    const api = new ApiHelper(request);

    // Create a new user
    const newUser = generateUser();
    const registerRes = await api.registerUser(newUser);
    const registerBody = (await registerRes.json()) as RegisterResponse;

    // Delete user by using the new user's ID and token
    const res = await api.deleteUser(registerBody.userID, "Wrong-Token");

    expect(res.status()).toBe(401);
  });
});
