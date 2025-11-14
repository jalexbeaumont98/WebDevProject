// server/models/Game.js
import mongoose from 'mongoose';
const { Schema } = mongoose;

const guessSchema = new Schema({
  player:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
  target:  { type: Schema.Types.ObjectId, ref: 'User', required: true },
  value:   { type: Number, required: true },
  result:  { type: String, enum: ['low','high','correct'], required: true },
  created: { type: Date, default: Date.now }
});

const gameSchema = new Schema({
  playerA: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  playerB: { type: Schema.Types.ObjectId, ref: 'User', required: true },

  // fixed range for now; later you can let them customize it
  range: {
    min: { type: Number, default: 1 },
    max: { type: Number, default: 100 }
  },

  // each player’s secret number (never sent to client while active)
  secretA: { type: Number },
  secretB: { type: Number },

  // simple flags to know if both picked
  hasSecretA: { type: Boolean, default: false },
  hasSecretB: { type: Boolean, default: false },

  guesses: [guessSchema],

  status: {
    type: String,
    enum: ['waiting','choosing','active','finished'],
    default: 'waiting'
  },

  turnUserId:   { type: Schema.Types.ObjectId, ref: 'User' },
  winnerUserId: { type: Schema.Types.ObjectId, ref: 'User' },

  created: { type: Date, default: Date.now },
  updated: { type: Date, default: Date.now }
});

// optional: never leak secrets while active
gameSchema.methods.toSafeJSON = function(currentUserId) {
  const obj = this.toObject();
  if (obj.status === 'active') {
    delete obj.secretA;
    delete obj.secretB;
  }
  // you could also filter other internals here if needed
  return obj;
};

export default mongoose.model('Game', gameSchema);