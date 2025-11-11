import mongoose from 'mongoose';
const { Schema } = mongoose;

const gameSchema = new Schema({
  playerA:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
  playerB:     { type: Schema.Types.ObjectId, ref: 'User', required: true },
  range:       { min: { type: Number, default: 1 }, max: { type: Number, default: 100 } },
  status:      { type: String, enum: ['waiting','active','finished'], default: 'waiting' },
  turnUserId:  { type: Schema.Types.ObjectId, ref: 'User' },
  winnerUserId:{ type: Schema.Types.ObjectId, ref: 'User' },
  created:     { type: Date, default: Date.now },
  updated:     { type: Date, default: Date.now }
});

export default mongoose.model('Game', gameSchema);