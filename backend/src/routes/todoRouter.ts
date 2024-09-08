import express from 'express';
import moment from 'moment-timezone';
import Todo from '../models/todoModel';

const router = express.Router();

// API for get all todo items.
router.get('/', async (req, res) => {
  console.log('[Todo] GET / ', req.body);
  try {
    const todos = await Todo.find({});

    const todosWithLocalTime = todos.map((todo) => ({
      _id: todo._id,
      title: todo.title,
      description: todo.description,
      category: todo.category,
      isFinished: todo.isFinished,
      dueDateUtc: todo.dueDateUtc,
      createdAtUtc: todo.createdAtUtc,
      updatedAtUtc: todo.updatedAtUtc,
    }));

    res.send(todosWithLocalTime);
  } catch (error) {
    console.log(error);
    res.status(500).send({ error: 'Failed to fetch todos' });
  }
});

// API for add 1 toto item
router.post('/', async (req, res) => {
  console.log('[Todo] POST / ', req.body);

  try {
    const {
      title,
      description,
      category,
      isFinished,
      dueDateUtc,
    } = req.body;

    const newTodo = new Todo({
      title,
      description,
      category,
      isFinished,
      dueDateUtc,
    });

    await newTodo.save();
    res.status(201).send(newTodo);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Failed to create todo' });
  }
});

// API for PATCH 1 todo item by id
router.patch('/:id', async (req, res) => {
  console.log('[Todo] PATCH / ', req.body);
  const { id } = req.params;
  const { title, description, category, isFinished, dueDateUtc } = req.body;

  try {
    // Create new ojbect for update, only update exist fields.
    let updateFields: any = {};

    if (title != null) {
      updateFields.title = title;
    }

    if (dueDateUtc != null) {
      updateFields.dueDateUtc = dueDateUtc;
    }

    if (description != null) {
      updateFields.description = description;
    }

    if (category != null) {
      updateFields.category = category;
    }

    if (isFinished != null) {
      updateFields.isFinished = isFinished;
    }

    updateFields.updatedAtUtc = new Date().toISOString();

    //  Use `findByIdAndUpdate` to update the new fields.，
    const updatedTodo = await Todo.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    if (!updatedTodo) {
      res.status(404).send({ error: 'Todo not found' });
      return;
    }

    res.send(updatedTodo);
  } catch (error) {
    res.status(500).send({ error: 'Failed to update todo' });
  }
});

// Get all todos by dueDateUtc
router.get('/by-date', async (req, res) => {
  const { dueDateUtc } = req.query;

  if (dueDateUtc == null || typeof dueDateUtc !== 'string') {
    res.status(400).send({ error: 'dueDate is required' });
    return;
  }

  try {
    const startOfDayUtc = moment.utc(dueDateUtc).startOf('day').toDate();
    const endOfDayUtc = moment.utc(dueDateUtc).endOf('day').toDate();

    // Get all todos within this day
    const todos = await Todo.find({
      dueDateUtc: { $gte: startOfDayUtc, $lte: endOfDayUtc },
    });

    res.send(todos);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch todos' });
  }
});

// Get 1 todo by id
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const todo = await Todo.findById(id);

    if (!todo) {
      res.status(404).send({ error: 'Todo not found' });
      return;
    }

    res.send(todo);
  } catch (error) {
    res.status(500).send({ error: 'Failed to fetch todo' });
  }
});

// API for delete 1 todo item by id
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const deletedTodo = await Todo.findByIdAndDelete(id);

    if (!deletedTodo) {
      res.status(404).send({ error: 'Todo not found' });
      return;
    }

    res.send({ message: 'Todo deleted successfully', todo: deletedTodo });
  } catch (error) {
    res.status(500).send({ error: 'Failed to delete todo' });
  }
});

export default router;
