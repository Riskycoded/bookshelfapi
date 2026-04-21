const express = require('express')
const app = express()

app.use(express.json())

let books = [
  { "title": "Harry Potter", "author": "J.K Rowling", "isRead": true, "publishedYear": 1997 },
  { "title": "Game of Thrones", "author": "George R.R Martin", "isRead": false, "publishedYear": 1996 },
  { "title": "Rich Dad Poor Dad", "author": "Robert Kiyosaki", "isRead": true, "publishedYear": 1997 }
]

function yearValidator(req, res, next) {
  const { publishedYear } = req.body
  const currentYear = new Date().getFullYear()

  if (!publishedYear) {
    return res.status(400).json({ error: 'publishedYear is required' })
  }

  if (publishedYear > currentYear) {
    return res.status(400).json({ error: `publishedYear cannot be in the future` })
  }

  next()
}

app.get('/books', (req, res) => {
  res.json(books)
})

app.post('/books', yearValidator, (req, res) => {
  const newBook = req.body
  books.push(newBook)
  res.json({ message: 'Book added!', books })
})

app.put('/books/:id', (req, res) => {
  const id = parseInt(req.params.id)
  if (id < 0 || id >= books.length) {
    return res.status(404).json({ error: 'Book not found' })
  }
  books[id] = { ...books[id], ...req.body }
  res.json({ message: 'Book updated!', book: books[id] })
})

app.delete('/books/:id', (req, res) => {
  const id = parseInt(req.params.id)
  if (id < 0 || id >= books.length) {
    return res.status(404).json({ error: 'Book not found' })
  }
  books.splice(id, 1)
  res.json({ message: 'Book deleted!', books })
})

app.listen(3000, () => {
  console.log('Server running on port 3000')
})