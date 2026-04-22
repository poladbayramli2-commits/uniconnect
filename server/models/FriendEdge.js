import mongoose from 'mongoose';

const friendEdgeSchema = new mongoose.Schema({
  participants: [{ type: String }],
  senderId: { type: String, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'declined'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

friendEdgeSchema.index({ participants: 1 });
friendEdgeSchema.index({ senderId: 1 });
friendEdgeSchema.index({ status: 1 });

friendEdgeSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

export default mongoose.model('FriendEdge', friendEdgeSchema);
