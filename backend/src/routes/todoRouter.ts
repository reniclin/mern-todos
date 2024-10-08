import express from 'express';
import dayjs from 'dayjs';
import Todo from '../models/todoModel';

const router = express.Router();

/**
 * API for add 1 toto item.
 **/
router.post('/', async (req, res) => {
  console.log('[todo] POST / ', req.body);

  try {
    const { title, description, category, isFinished, dueDateUtc } = req.body;

    if (title == null || typeof title !== 'string' || title.length === 0) {
      res.status(400).json({ error: 'title is required for create new todo' });
      return;
    }

    const newTodo = new Todo({
      title,
      description,
      category,
      isFinished,
      dueDateUtc,
    });

    await newTodo.save();

    res.status(201).json(newTodo);
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else if (typeof error === 'string') {
      console.error(error);
    }

    res.status(500).json({ error: 'Failed to create todo' });
  }
});

/**
 * API for get all todo items.
 **/
router.get('/', async (req, res) => {
  console.log('[todo] GET / ', req.body);

  try {
    const todos = await Todo.find({});

    res.json(todos);
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else if (typeof error === 'string') {
      console.error(error);
    }

    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

/**
 * Get all todos by dueDateUtc.
 **/
router.get('/by-due-date', async (req, res) => {
  const { dueDateUtc } = req.query;
  console.log(`[todo] GET /by-due-date, dueDateUtc:`, dueDateUtc, req.body);

  if (dueDateUtc == null || typeof dueDateUtc !== 'string') {
    res.status(400).json({ error: 'dueDate is required' });
    return;
  }

  try {
    const startOfDayUtc = dayjs(dueDateUtc).startOf('day').toISOString();
    const endOfDayUtc = dayjs(dueDateUtc).endOf('day').toISOString();

    // Get all todos within this day
    const todos = await Todo.find({
      dueDateUtc: { $gte: startOfDayUtc, $lte: endOfDayUtc },
    });

    res.json(todos);
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else if (typeof error === 'string') {
      console.error(error);
    }

    res.status(500).json({ error: 'Failed to fetch todos' });
  }
});

/**
 * Get 1 todo by id.
 **/
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`[todo] GET id: ${id} `, req.body);

  if (id == null || typeof id !== 'string' || id.length === 0) {
    res.status(400).json({ error: 'id is required' });
    return;
  }

  try {
    const todo = await Todo.findById(id);

    if (!todo) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }

    res.json(todo);
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else if (typeof error === 'string') {
      console.error(error);
    }

    res.status(500).json({ error: `Failed to fetch todo ${id}` });
  }
});

/**
 * API for PATCH 1 todo item by id.
 **/
router.patch('/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`[todoSql] PATCH id: ${id} `, req.body);

  if (id == null || typeof id !== 'string' || id.length === 0) {
    res.status(400).json({ error: 'id is required' });
    return;
  }

  try {
    const { title, description, category, isFinished, dueDateUtc } = req.body;

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
      res.status(404).json({ error: 'Todo not found' });
      return;
    }

    res.json(updatedTodo);
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else if (typeof error === 'string') {
      console.error(error);
    }

    res.status(500).json({ error: 'Failed to update todo' });
  }
});

/**
 * API for delete 1 todo item by id.
 **/
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  console.log(`[todo] DELETE id: ${id} `, req.body);

  if (id == null || typeof id !== 'string' || id.length === 0) {
    res.status(400).json({ error: 'id is required' });
    return;
  }

  try {
    const deletedTodo = await Todo.findByIdAndDelete(id);

    if (!deletedTodo) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }

    res.json(deletedTodo);
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else if (typeof error === 'string') {
      console.error(error);
    }

    res.status(500).json({ error: 'Failed to delete todo' });
  }
});

export default router;
