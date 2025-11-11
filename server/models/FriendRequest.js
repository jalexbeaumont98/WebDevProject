import mongoose from 'mongoose';
const { Schema } = mongoose;

const friendRequestSchema = new Schema({
  fromUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  toUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  created: { type: Date, default: Date.now }
}, { indexes: [{ fromUserId: 1, toUserId: 1, unique: true }] });

export default mongoose.model('FriendRequest', friendRequestSchema);