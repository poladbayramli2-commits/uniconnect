import mongoose from 'mongoose';

const letterSchema = new mongoose.Schema({
  authorUid: { type: String, required: true },
  recipientUids: [{ type: String }],
  body: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

letterSchema.index({ authorUid: 1 });
letterSchema.index({ recipientUids: 1 });
letterSchema.index({ createdAt: -1 });

export default mongoose.model('Letter', letterSchema);
