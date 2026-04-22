import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  firstName: { type: String, default: "" },
  lastName: { type: String, default: "" },
  email: { type: String, required: true, unique: true },
  university: { type: String, default: "" },
  major: { type: String, default: "" },
  hobbies: [{ type: String }],
  city: { type: String, default: "" },
  course: { type: Number, default: null },
  age: { type: Number, default: null },
  photoURL: { type: String, default: "" },
  verifiedStudent: { type: Boolean, default: false },
  todayMood: { type: String, default: null },
  todayMoodDate: { type: String, default: null },
  puzzleWins: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

userSchema.index({ university: 1 });
userSchema.index({ hobbies: 1 });
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ uid: 1 }, { unique: true });

userSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('User', userSchema);
