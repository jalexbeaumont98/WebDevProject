//import express from "express";
//var express = require("express");
//var app = express();
import app from "./server/express.js";
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import express from 'express';
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import compress from 'compression';
import cors from 'cors';
import helmet from 'helmet';



// Routes
import authRoutes from './server/routes/authRoutes.js';
import usersRoutes from './server/routes/usersRoutes.js';
import friendRequestsRoutes from './server/routes/friendRequestsRoutes.js';
import gamesRoutes from './server/routes/gamesRoutes.js';
import friendsRoutes from './server/routes/friendsRoutes.js';

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/friends/requests', friendRequestsRoutes);
app.use('/api/games', gamesRoutes);
app.use('/api/friends', friendsRoutes);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(compress());
app.use(helmet());
app.use(cors());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from the same folder as server.js
dotenv.config({ path: path.join(__dirname, '.env') });

mongoose.connect(process.env.MONGO_URI)
  .then((conn) => {
    console.log('Connected to MongoDB');
    console.log(`Database: ${conn.connection.name}`);
    console.log(`Host: ${conn.connection.host}`);
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));





app.get('/', (req, res) => {
  res.json({ message: "Welcome to my Portfolio Application" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(400).json({ error: err.message || 'Unknown error' });
});



const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}/`));
//module.exports = app;
export default app;
