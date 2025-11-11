import User from '../models/User.js';


// Sign-up (creates a user; password hashed by pre-save)
export const create = async (req, res, next) => {
  try {
    const u = await User.create(req.body); // expects {name,email,password,...}
    res.status(201).json({ _id: u._id, name: u.name, email: u.email });
  } catch (err) {
    next(err);
  }
};

// Attach user to req.profile
export const userByID = async (req, res, next, id) => {
  try {
    const u = await User.findById(id).select('-password');
    if (!u) return res.status(400).json({ error: 'User not found' });
    req.profile = u;
    next();
  } catch (err) {
    next(err);
  }
};

// Read profile (protected + authorized)
export const read = (req, res) => res.json(req.profile);

export const getAll = async (req, res, next) => {
  try { const docs = await User.find(); res.json(docs); }
  catch (err) { next(err); }
};

export const getById = async (req, res, next) => {
  try {
    const doc = await User.findById(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (err) { next(err); }
};

export const createOne = async (req, res, next) => {
  try { const doc = await User.create(req.body); res.status(201).json(doc); }
  catch (err) { next(err); }
};

export const updateById = async (req, res, next) => {
  try {
    const doc = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doc) return res.status(404).json({ message: 'Not found' });
    res.json(doc);
  } catch (err) { next(err); }
};

export const removeById = async (req, res, next) => {
  try {
    const doc = await User.findByIdAndDelete(req.params.id);
    if (!doc) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.json({
      message: 'Document successfully deleted',
      deleted: doc
    });
  } catch (err) {
    next(err);
  }
};

export const removeAll = async (req, res, next) => {
  try {
    const result = await User.find({});
    if (result.length === 0) {
      return res.status(404).json({ message: 'No documents to delete' });
    }

    await User.deleteMany({});
    res.json({
      message: `${result.length} documents deleted`,
      deleted: result
    });
  } catch (err) {
    next(err);
  }
};