import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  chatId: { type: String, required: true },
  senderId: { type: String, required: true },
  text: { type: String, required: true },
  participants: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
});

messageSchema.index({ chatId: 1, createdAt: 1 });

export default mongoose.model('Message', messageSchema);
