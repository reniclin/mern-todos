import mongoose from 'mongoose';
const { Schema } = mongoose;

const todoSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  category: { type: String, default: 'None' },
  isFinished: { type: Boolean, default: false },
  createdAtUtc: { type: Date, default: Date.now },
  updatedAtUtc: { type: Date, default: Date.now },
  dueDateUtc: { type: Date, required: false },
});

const Todo = mongoose.model('Todo', todoSchema);

export default Todo;
