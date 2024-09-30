import express from 'express';
import dayjs from 'dayjs';
import pool from '../models/awsPostgreSqlDb';
import { SqlTodo } from '../models/todoSqlType';

function snakeToCamel(obj: any) {
  const newObj: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
      newObj[camelKey] = obj[key];
    }
  }
  return newObj;
}

const router = express.Router();

/**
 * API for add 1 toto item.
 **/
router.post('/', async (req, res) => {
  console.log('[todoSql] POST / ', req.body);

  try {
    const { title, description, category, dueDateUtc, isFinished }: SqlTodo =
      req.body;

    if (title == null || typeof title !== 'string' || title.length === 0) {
      res.status(400).json({ error: 'title is required for create new todo' });
      return;
    }

    const newTodo = await pool.query(
      `INSERT INTO todos (title, description, category, due_date_utc, is_finished)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [
        title,
        description ?? '',
        category ?? 'None',
        dueDateUtc,
        isFinished ?? false,
      ]
    );

    res.status(201).json(newTodo.rows[0]);
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
  console.log('[todoSql] GET / ', req.body);

  try {
    const allTodos = await pool.query('SELECT * FROM todos');
    const todosCamelCase = allTodos.rows.map((todo: any) => snakeToCamel(todo));

    res.status(200).json(todosCamelCase);
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else if (typeof error === 'string') {
      console.error(error);
    }

    res.status(500).json({ error: 'Server Error' });
  }
});

/**
 * Get all todos by dueDateUtc.
 **/
router.get('/by-due-date', async (req, res) => {
  const { dueDateUtc } = req.query;
  console.log(`[todoSql] GET /by-due-date, dueDateUtc:`, dueDateUtc, req.body);

  if (dueDateUtc == null || typeof dueDateUtc !== 'string') {
    res.status(400).json({ error: 'dueDate is required' });
    return;
  }

  try {
    const startOfDayUtc = dayjs(dueDateUtc).startOf('day').toISOString();
    const endOfDayUtc = dayjs(dueDateUtc).endOf('day').toISOString();

    const todosByDueDate = await pool.query(
      'SELECT * FROM todos WHERE due_date_utc BETWEEN $1 AND $2',
      [startOfDayUtc, endOfDayUtc]
    );

    res.json(todosByDueDate.rows);
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
  console.log(`[todoSql] GET id: ${id} `, req.body);

  if (id == null || typeof id !== 'string' || id.length === 0) {
    res.status(400).json({ error: 'id is required' });
    return;
  }

  try {
    const todo = await pool.query('SELECT * FROM todos WHERE id = $1', [id]);

    if (todo.rows.length === 0) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }

    res.json(todo.rows[0]);
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
    const {
      title,
      description,
      category,
      isFinished,
      dueDateUtc,
    }: Partial<SqlTodo> = req.body;

    // Query current value by id
    const currentTodo = await pool.query('SELECT * FROM todos WHERE id = $1', [
      id,
    ]);

    if (currentTodo.rows.length === 0) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }

    const todo = currentTodo.rows[0];

    const updatedTodo = await pool.query(
      `UPDATE todos
       SET
         title = $1,
         description = $2,
         category = $3,
         is_finished = $4,
         due_date_utc = $5,
         updated_at_utc = CURRENT_TIMESTAMP
       WHERE id = $6
       RETURNING *`,
      [
        title ?? todo.title, // Keep original value if no new value
        description ?? todo.description, // Keep original value if no new value
        category ?? todo.category, // Keep original value if no new value
        isFinished ?? todo.is_finished, // Keep original value if no new value
        dueDateUtc ?? todo.due_date_utc, // Keep original value if no new value
        id,
      ]
    );

    res.json(updatedTodo.rows[0]);
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
  console.log(`[todoSql] DELETE id: ${id} `, req.body);

  if (id == null || typeof id !== 'string' || id.length === 0) {
    res.status(400).json({ error: 'id is required' });
    return;
  }

  try {
    const deleteTodo = await pool.query(
      'DELETE FROM todos WHERE id = $1 RETURNING *',
      [id]
    );

    if (deleteTodo.rows.length === 0) {
      res.status(404).json({ error: 'Todo not found' });
      return;
    }

    res.json(deleteTodo.rows[0]);
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
