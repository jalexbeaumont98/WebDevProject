// server/__tests__/auth.test.js
import 'dotenv/config';
import request from "supertest";
import mongoose from "mongoose";

import app from "../test-app.js";
import { connectDB } from "../db.js";
import User from "../models/User.js";
import { jest } from '@jest/globals';


// Give Jest enough time for Mongo on Windows / Atlas
jest.setTimeout(30000);

beforeAll(async () => {
  const uri = process.env.MONGO_URI_TEST || process.env.MONGO_URI;
  if (!uri) throw new Error("No test Mongo URI set");
  await connectDB(uri);
});

beforeEach(async () => {
  // clean users before each test so emails are unique
  await User.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

/**
 * Helper to sign up a user using the same API your frontend uses.
 * Adjust the payload fields if your controller expects different names.
 */
async function signupUser({ displayName, email, password }) {
  return request(app)
    .post("/api/auth/signup")
    .send({ displayName, email, password });
}

describe("Auth API", () => {
  test("signup creates a new user", async () => {
    const res = await signupUser({
      displayName: "Alice",
      email: "alice@example.com",
      password: "test1234",
    });

    // Whatever your signup controller returns; adjust as needed
    expect(res.statusCode).toBe(201); // if you use 200, change this
    expect(res.body).toHaveProperty("user");
    expect(res.body.user).toHaveProperty("_id");
    expect(res.body.user).toHaveProperty("displayName", "Alice");
    expect(res.body.user).toHaveProperty("email", "alice@example.com");

    // Ensure password isn’t in response
    expect(res.body.user.password).toBeUndefined();
  });

  test("signup rejects duplicate email", async () => {
    const payload = {
      displayName: "Bob",
      email: "bob@example.com",
      password: "secret123",
    };

    // First signup should succeed
    const first = await signupUser(payload);
    expect(first.statusCode).toBe(201);

    // Second with same email should fail
    const second = await signupUser(payload);

    // depending on your controller, 400 is typical
    expect([400, 409]).toContain(second.statusCode);
    expect(second.body.error || second.body.message).toBeTruthy();
  });

  test("signin succeeds with valid credentials and returns token + user", async () => {
    const email = "carol@example.com";
    const password = "mypassword";

    const signupRes = await signupUser({
      displayName: "Carol",
      email,
      password,
    });
    expect(signupRes.statusCode).toBe(201);

    const signinRes = await request(app)
      .post("/api/auth/signin")
      .send({ email, password });

    expect(signinRes.statusCode).toBe(200); // or 201 if that’s your choice
    expect(signinRes.body).toHaveProperty("token");
    expect(signinRes.body).toHaveProperty("user");
    expect(signinRes.body.user).toHaveProperty("email", email);
  });

  test("signin fails with wrong password", async () => {
    const email = "dave@example.com";
    const password = "goodpass";

    await signupUser({
      displayName: "Dave",
      email,
      password,
    });

    const res = await request(app)
      .post("/api/auth/signin")
      .send({ email, password: "badpass" });

    // you use 401 in your controllers for invalid login; if not, adjust
    expect([400, 401]).toContain(res.statusCode);
    expect(res.body.error || res.body.message).toBeTruthy();
  });

  test("signin fails for unknown email", async () => {
    const res = await request(app)
      .post("/api/auth/signin")
      .send({ email: "nobody@example.com", password: "anything" });

    expect([400, 401]).toContain(res.statusCode);
    expect(res.body.error || res.body.message).toBeTruthy();
  });

  test("signout returns a success response", async () => {
    // depending on your implementation, signout doesn’t need a token
    const res = await request(app).get("/api/auth/signout");

    // Common patterns: 200 with JSON, or 204 no content
    expect([200, 204]).toContain(res.statusCode);
  });
});