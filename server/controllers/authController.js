import jwt from 'jsonwebtoken';
import { expressjwt } from 'express-jwt';
import config from '../../config/config.js';
import User from '../models/User.js';

export const signin = async (req, res) => {
  try {
    const { email, password } = req.body;
    const u = await User.findOne({ email });
    if (!u) return res.status(401).json({ error: 'User not found' });

    const ok = await u.comparePassword(password);
    if (!ok) return res.status(401).json({ error: "Email and password don't match." });

    const token = jwt.sign({ _id: u._id }, config.jwtSecret);
    res.cookie('t', token, { expire: new Date() + 9999 });

    return res.json({
      token,
      user: { _id: u._id, name: u.name, email: u.email }
    });
  } catch (err) {
    return res.status(401).json({ error: 'Could not sign in' });
  }
};

export const signout = (req, res) => {
  res.clearCookie('t');
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