const express = require('express')
const morgan = require('morgan')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')
const { body, validationResult } = require('express-validator')
const compression = require('compression')
const app = express()

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, slow down!' }
})

app.use(express.json())
app.use(morgan('dev'))
app.use(helmet())
app.use(limiter)
app.use(compression())


let nextId = 3

let books = [
  { "id": 0, "title": "Harry Potter", "author": "J.K Rowling", "isRead": true, "publishedYear": 1997 },
  { "id": 1, "title": "Game of Thrones", "author": "George R.R Martin", "isRead": false, "publishedYear": 1996 },
  { "id": 2, "title": "Rich Dad Poor Dad", "author": "Robert Kiyosaki", "isRead": true, "publishedYear": 1997 }
]

function yearValidator(req, res, next) {
  const { publishedYear } = req.body
  const currentYear = new Date().getFullYear()

  if (!publishedYear) {
    return res.status(400).json({ error: 'publishedYear is required' })
  }
  if (publishedYear > currentYear) {
    return res.status(400).json({ error: 'publishedYear cannot be in the future' })
  }
  next()
}

const bookValidationRules = [
  body('title').notEmpty().withMessage('Title is required'),
  body('author').notEmpty().withMessage('Author is required'),
  body('isRead').isBoolean().withMessage('isRead must be true or false'),
  body('publishedYear').isNumeric().withMessage('publishedYear must be a number')
]

app.get('/books', (req, res, next) => {
  try {
    res.json(books)
  } catch (err) {
    next(err)
  }
})

app.post('/books', bookValidationRules, yearValidator, (req, res, next) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }
    
    const newBook = { id: nextId++, ...req.body }
    books.push(newBook)
    res.json({ message: 'Book added!', books })
  } catch (err) {
    next(err)
  }
})

app.put('/books/:id', (req, res, next) => {
  try {
    const id = parseInt(req.params.id)
  
    const bookIndex = books.findIndex(book => book.id === id)
    if (bookIndex === -1) {
      return res.status(404).json({ error: 'Book not found' })
    }
    books[bookIndex] = { ...books[bookIndex], ...req.body, id } 
    res.json({ message: 'Book updated!', book: books[bookIndex] })
  } catch (err) {
    next(err)
  }
})

app.delete('/books/:id', (req, res, next) => {
  try {
    const id = parseInt(req.params.id)
   
    const bookIndex = books.findIndex(book => book.id === id)
    if (bookIndex === -1) {
      return res.status(404).json({ error: 'Book not found' })
    }
    books.splice(bookIndex, 1)
    res.json({ message: 'Book deleted!', books })
  } catch (err) {
    next(err)
  }
})

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: `Route ${req.url} not found` })
})

// Error handler 
app.use((err, req, res, next) => {
  console.error(err.message)
  res.status(500).json({ error: err.message })
})

app.listen(3000, () => {
  console.log('Server running on port 3000')
})