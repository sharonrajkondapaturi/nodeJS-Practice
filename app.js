/*
 *  Created a Table with name todo in the todoApplication.db file using the CLI.
 */

const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const databasePath = path.join(__dirname, 'todoApplication.db')

const app = express()

app.use(express.json())

let database = null

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    })

    app.listen(3000, () =>
      console.log('Server Running at http://localhost:3000/'),
    )
  } catch (error) {
    console.log(`DB Error: ${error.message}`)
    process.exit(1)
  }
}

initializeDbAndServer()

const hasCategoryAndPriority = requestQuery => {
  return (
    requestQuery.category !== undefined && requestQuery.priority !== undefined
  )
}

app.get('/todos/', async (request, response) => {
  let data = null
  let dataQuery = ''
  const {search_q = '', priority, status, category, dueDate} = request.query
  if (status !== undefined && priority !== undefined) {
    if (
      (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') &&
      (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW')
    ) {
      dataQuery = `
      SELECT *
      FROM todo
      WHERE priority = "${priority}" AND status = "${status}"`
    } else {
      response.status(400)
      response.send('Invalid Todo Priority And Status')
    }
  }
  if (status !== undefined) {
    if (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE') {
      dataQuery = `
      SELECT *
      FROM todo
      WHERE status = "${status}";`
    } else {
      response.status(400)
      response.send('Invalid Todo Status')
    }
  }
  if (priority !== undefined) {
    if (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW') {
      dataQuery = `
      SELECT *
      FROM todo
      WHERE priority = "${priority}"`
    } else {
      response.status(400)
      response.send('Invalid Todo Priority')
    }
  }
  if (category !== undefined && status !== undefined) {
    if (category === undefined || status === undefined) {
      response.status(400)
      response.send('Invalid Todo Category And Status')
    } else if (
      (category === 'WORK' || category === 'HOME' || category === 'LEARNING') &&
      (status === 'TO DO' || status === 'IN PROGRESS' || status === 'DONE')
    ) {
      dataQuery = `
      SELECT *
      FROM todo
      WHERE category = "${category}" AND status = "${status}"`
    }
  }
  if (category !== undefined) {
    if (category === undefined) {
      response.status(400)
      response.send('Invalid Todo Category')
    } else if (
      category === 'WORK' ||
      category === 'HOME' ||
      category === 'LEARNING'
    ) {
      dataQuery = `
      SELECT *
      FROM todo
      WHERE category = "${category}";`
    }
  }
  if (category !== undefined && priority !== undefined) {
    if (
      (category === 'WORK' || category === 'HOME' || category === 'LEARNING') &&
      (priority === 'HIGH' || priority === 'MEDIUM' || priority === 'LOW')
    ) {
      dataQuery = `
      SELECT *
      FROM todo
      WHERE category = "${category}" AND priority = "${priority}"`
    } else {
      response.status(400)
      response.send('Invalid Todo Category And Priority')
    }
  } else {
    dataQuery = `
      SELECT *
      FROM todo
      WHERE todo LIKE "%${search_q}%";`
  }
  data = await database.all(dataQuery)
  response.send(data)
})

app.get('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params

  const getTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE
      id = ${todoId};`
  const todo = await database.get(getTodoQuery)
  response.send(todo)
})

app.post('/todos/', async (request, response) => {
  const {id, todo, priority, status} = request.body
  const postTodoQuery = `
  INSERT INTO
    todo (id, todo, priority, status)
  VALUES
    (${id}, '${todo}', '${priority}', '${status}');`
  await database.run(postTodoQuery)
  response.send('Todo Successfully Added')
})

app.put('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  let updateColumn = ''
  const requestBody = request.body
  switch (true) {
    case requestBody.status !== undefined:
      updateColumn = 'Status'
      break
    case requestBody.priority !== undefined:
      updateColumn = 'Priority'
      break
    case requestBody.todo !== undefined:
      updateColumn = 'Todo'
      break
  }
  const previousTodoQuery = `
    SELECT
      *
    FROM
      todo
    WHERE 
      id = ${todoId};`
  const previousTodo = await database.get(previousTodoQuery)

  const {
    todo = previousTodo.todo,
    priority = previousTodo.priority,
    status = previousTodo.status,
  } = request.body

  const updateTodoQuery = `
    UPDATE
      todo
    SET
      todo='${todo}',
      priority='${priority}',
      status='${status}'
    WHERE
      id = ${todoId};`

  await database.run(updateTodoQuery)
  response.send(`${updateColumn} Updated`)
})

app.delete('/todos/:todoId/', async (request, response) => {
  const {todoId} = request.params
  const deleteTodoQuery = `
  DELETE FROM
    todo
  WHERE
    id = ${todoId};`

  await database.run(deleteTodoQuery)
  response.send('Todo Deleted')
})

module.exports = app
