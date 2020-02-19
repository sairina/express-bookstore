process.env.NODE_ENV = 'test';

const app = require('./app');
const request = require('supertest');
const db = require('./db');
const Book = require('./models/book');
let b1;


describe("books routes tests", function () {

  beforeEach(async function () {
    await db.query("DELETE FROM books");

    b1 = await Book.create(
      {
        "isbn": "0691161518",
        "amazon_url": "http://a.co/eobPtX2",
        "author": "Matthew Lane",
        "language": "english",
        "pages": 264,
        "publisher": "Princeton University Press",
        "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
        "year": 2017
      }
    );
  });

  test("GET /books", async function () {
    const response = await request(app)
      .get('/books');

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ books: [b1] });
  });

  test("GET /books/:id", async function () {
    const response = await request(app)
      .get(`/books/${b1.isbn}`);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({ book: b1 });
  });

  test("GET does not work for /books/:id", async function () {
    const response = await request(app)
      .get('/books/none');

    expect(response.statusCode).toBe(404);
  });

  test("POST /books", async function () {
    let newBook = {
      "isbn": "0694569832",
      "amazon_url": "http://a.co/eobPtX2",
      "author": "apwoefpusd",
      "language": "awoefa",
      "pages": 264,
      "publisher": "Princeton University Press",
      "title": "awuehfauwefawejfapfh",
      "year": 2017
    };
    const response = await request(app)
      .post('/books')
      .send(newBook);
    expect(response.statusCode).toBe(201);
    expect(response.body).toEqual({ book: newBook });

    const newResponse = await request(app)
      .get(`/books/${newBook.isbn}`);

    expect(newResponse.statusCode).toBe(200);
  });

  test("POST does not post to /books", async function () {
    let failBook = {
      "isbn": "0694569832",
      "amazon_url": "http://a.co/eobPtX2",
      "author": "apwoefpusd",
      "language": "awoefa",
      "pages": "264",
      "publisher": "Princeton University Press",
      "title": "awuehfauwefawejfapfh",
      "year": 2017
    };

    const response = await request(app)
      .post('/books')
      .send(failBook);

    expect(response.statusCode).toBe(400);

    failBook = {
      "title": "awuehfauwefawejfapfh"
    };

    const responseTwo = await request(app)
      .post('/books')
      .send(failBook);

    expect(responseTwo.statusCode).toBe(400);
  });

  test("PUT /books/:id", async function () {
    let b1Update = {
      "isbn": "0691161518",
      "author": "Will Grover",
      "language": "english",
      "pages": 264,
      "publisher": "Princeton University Press",
      "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
      "year": 2017
    }
    const response = await request(app)
      .put(`/books/${b1.isbn}`)
      .send(b1Update);

    expect(response.statusCode).toBe(200);
    expect(response.body).toEqual({
      book: {
        "isbn": b1Update.isbn,
        "amazon_url": null,
        "author": b1Update.author,
        "language": b1Update.language,
        "pages": b1Update.pages,
        "publisher": b1Update.publisher,
        "title": b1Update.title,
        "year": b1Update.year
      }
    });
  });

  test("PUT does not put to /books/:id", async function () {
    let b1Update = {
      "isbn": "0691161518",
      "author": "Will Grover",
      "language": "english",
      "pages": 264,
      "publisher": "Princeton University Press",
      "title": "Power-Up: Unlocking the Hidden Mathematics in Video Games",
      "year": 2017
    }

    const response = await request(app)
      .put(`/books/none`)
      .send(b1Update);

      expect(response.statusCode).toBe(404);

      b1Update.pages = "264";

    const responseTwo = await request(app)
      .put(`/books/${b1.isbn}`)
      .send(b1Update);

      expect(responseTwo.statusCode).toBe(400);
  });

  test("DELETE /books/:id", async function () {
    const response = await request(app)
      .delete(`/books/${b1.isbn}`)

    expect(response.statusCode).toBe(200);
  });

  test("DELETE does not delete /books/:id", async function () {
    const response = await request(app)
      .delete(`/books/none`)

    expect(response.statusCode).toBe(404);
  });
});

afterAll(function () {
  db.end();
})
