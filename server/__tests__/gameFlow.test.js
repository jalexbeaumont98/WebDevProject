// server/__tests__/gameFlow.test.js
import 'dotenv/config';
import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';

import app from '../test-app.js';
import { connectDB } from '../db.js';
import User from '../models/User.js';
import Game from '../models/Game.js';
// If you have a FriendRequest model and want to clean it, import it too:
// import FriendRequest from '../models/FriendRequest.js';

jest.setTimeout(30000); // allow enough time for Atlas, etc.

// Connect once for the whole file
beforeAll(async () => {
  const uri = process.env.MONGO_URI_TEST || process.env.MONGO_URI;
  if (!uri) throw new Error("No test Mongo URI set");
  await connectDB(uri);
});

// Clean collections between tests
beforeEach(async () => {
  await User.deleteMany({});
  await Game.deleteMany({});
  // If you have FriendRequest:
  // await FriendRequest.deleteMany({});
});

afterAll(async () => {
  await mongoose.connection.close();
});

async function signupAndLogin({ name, displayName, email, password }) {
  // 1) Signup
  await request(app)
    .post('/api/auth/signup')
    .send({ name, displayName, email, password })
    .expect(201);

  // 2) Signin
  const res = await request(app)
    .post('/api/auth/signin')
    .send({ email, password })
    .expect(200);

  expect(res.body).toHaveProperty('token');
  expect(res.body).toHaveProperty('user');

  return {
    token: res.body.token,
    user: res.body.user,
  };
}

describe('Game flow', () => {
  test('two users can friend, create a game, set secrets, and play until one wins', async () => {
    // --- 1. Sign up + sign in two users ---
    const aliceCreds = await signupAndLogin({
      name: 'Alice',
      displayName: 'Alice',
      email: 'alice_game@example.com',
      password: 'test1234',
    });

    const bobCreds = await signupAndLogin({
      name: 'Bob',
      displayName: 'Bob',
      email: 'bob_game@example.com',
      password: 'test1234',
    });

    const aliceId = aliceCreds.user._id;
    const bobId   = bobCreds.user._id;

    // --- 2. Alice sends a friend request to Bob ---
    const frRes = await request(app)
      .post('/api/friends/requests')
      .set('Authorization', `Bearer ${aliceCreds.token}`)
      .send({ toUserId: bobId })
      .expect(201);

    const friendRequest = frRes.body;
    expect(friendRequest).toHaveProperty('_id');
    expect(friendRequest).toHaveProperty('status', 'pending');

    // --- 3. Bob sees his incoming friend requests ---
    const requestsRes = await request(app)
      .get('/api/friends/requests')
      .set('Authorization', `Bearer ${bobCreds.token}`)
      .expect(200);

    const requests = Array.isArray(requestsRes.body) ? requestsRes.body : [];
    expect(requests.length).toBe(1);
    const requestId = requests[0]._id;

    // --- 4. Bob accepts the friend request ---
    const acceptRes = await request(app)
      .post(`/api/friends/requests/${requestId}`)
      .set('Authorization', `Bearer ${bobCreds.token}`)
      .send({ action: 'accept' })
      .expect(200);

    expect(acceptRes.body.status || acceptRes.body.friend?.status).toBe('accepted');

    // --- 5. Alice’s friends list now includes Bob ---
    const friendsRes = await request(app)
      .get('/api/friends')
      .set('Authorization', `Bearer ${aliceCreds.token}`)
      .expect(200);

    const friends = friendsRes.body.friends || friendsRes.body;
    expect(Array.isArray(friends)).toBe(true);
    expect(friends.length).toBe(1);
    expect(String(friends[0]._id)).toBe(String(bobId));

    // --- 6. Alice creates a game vs Bob ---
    const createGameRes = await request(app)
      .post('/api/games')
      .set('Authorization', `Bearer ${aliceCreds.token}`)
      .send({ opponentId: bobId }) // adjust if your body field name differs
      .expect(201);

    const game = createGameRes.body;
    expect(game).toHaveProperty('_id');
    const gameId = game._id;

    // --- 7. Both players set their secret numbers ---
    const secretA = 42; // Alice's secret
    const secretB = 17; // Bob's secret

    await request(app)
      .post(`/api/games/${gameId}/secret`)
      .set('Authorization', `Bearer ${aliceCreds.token}`)
      .send({ secret: secretA })
      .expect(200);

    await request(app)
      .post(`/api/games/${gameId}/secret`)
      .set('Authorization', `Bearer ${bobCreds.token}`)
      .send({ secret: secretB })
      .expect(200);

    // --- 8. Check whose turn it is ---
    const getGameRes = await request(app)
      .get(`/api/games/${gameId}`)
      .set('Authorization', `Bearer ${aliceCreds.token}`)
      .expect(200);

    const gameData = getGameRes.body.game || getGameRes.body;
    expect(gameData).toHaveProperty('turnUserId');

    const turnUserId = String(gameData.turnUserId);
    const aliceTurn = turnUserId === String(aliceId);

    // If it's Alice's turn, she guesses Bob's secret (17) correctly.
    // If it's Bob's turn, he guesses Alice's secret (42) correctly.
    const actingToken   = aliceTurn ? aliceCreds.token : bobCreds.token;
    const actingUserId  = aliceTurn ? aliceId : bobId;
    const correctSecret = aliceTurn ? secretB : secretA;

    // --- 9. The acting player makes one correct guess and wins ---
    const guessRes = await request(app)
      .post(`/api/games/${gameId}/guess`)
      .set('Authorization', `Bearer ${actingToken}`)
      .send({ value: correctSecret })
      .expect(200);

    const guessBody   = guessRes.body;
    const guessResult = guessBody.result;
    const updatedGame = guessBody.game || guessBody;

    expect(guessResult).toBe('correct');
    expect(updatedGame.status).toBe('finished');

    const winnerId = String(updatedGame.winnerUserId || updatedGame.winner);
    expect(winnerId).toBe(String(actingUserId));
  });
});