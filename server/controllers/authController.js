import jwt from 'jsonwebtoken';
import { expressjwt } from 'express-jwt';
import config from '../../config/config.js';
import User from '../models/User.js';


export const signup = async (req, res) => {
  try {
    const { name, displayName, email, password } = req.body;

    const display = displayName || name;
    if (!display || !email || !password) {
      return res
        .status(400)
        .json({ error: 'display/name, email and password are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ error: 'Email already exists' });
    }

    const user = new User({
      displayName: display,
      email,
      password // bcrypt hashing happens in the pre('save') hook on the schema
    });
    await user.save();

    return res.status(201).json({
      message: 'User created',
      user: {
        _id: user._id,
        displayName: user.displayName,
        email: user.email
      }
    });
  } catch (err) {
    console.error('Signup error:', err);
    return res.status(500).json({ error: 'Could not create user' });
  }
};


export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const u = await User.findOne({ email });
    if (!u) return res.status(401).json({ error: 'User not found' });

    const ok = await u.comparePassword(password);
    if (!ok)
      return res
        .status(401)
        .json({ error: "Email and password don't match." });

    const token = jwt.sign({ _id: u._id }, config.jwtSecret);
    // NOTE: res.cookie won't exist in Vercel handler; that's fine, we only really need the token in JSON
    if (typeof res.cookie === 'function') {
      res.cookie('t', token, { expire: new Date() + 9999 });
    }

    return res.json({
      token,
      user: { _id: u._id, name: u.displayName, email: u.email }
    });
  } catch (err) {
    console.error('Signin error:', err);
    return res.status(401).json({ error: 'Could not sign in' });
  }
};


export const signout = (req, res) => {
  if (typeof res.clearCookie === 'function') {
    res.clearCookie('t');
  }
  return res.status(200).json({ message: 'signed out' });
};

export const requireSignin = expressjwt({
  secret: config.jwtSecret,
  algorithms: ['HS256'],
  userProperty: 'auth'
});

export const hasAuthorization = (req, res, next) => {
  // expects req.profile from userByID and req.auth from requireSignin
  const authorized = req.profile && req.auth && String(req.profile._id) === String(req.auth._id);
  if (!authorized) return res.status(403).json({ error: 'User is not authorized' });
  next();
};