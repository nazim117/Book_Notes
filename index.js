import express from "express";
import bodyParser from "body-parser";
import axios from "axios";
import pg from "pg";

const app = express();
const port = 3000;

const db = new pg.Client({
  host:"localhost",
  user:"postgres",
  password:"yourPassword",
  database:"book_notes",
  port:5432
});

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.get("/", async (req, res) => {
  try {
      const result = await db.query("SELECT * FROM books");
      let books = result.rows.map(book => book);
      res.render("index.ejs", { books: books });
  } catch (error) {
      console.error("Error retrieving countries:", error);
      res.status(500).send("Internal Server Error");
  }
});

app.get("/edit/:id", async (req,res) => {
    const bookId = req.params.id;
    try {
        const result = await db.query("SELECT * FROM books WHERE Id = ($1)", [bookId]);
        console.log(result.rows[0]);
        let book = result.rows[0];
        res.render("edit.ejs", { book: book });
    } catch (error) {
        console.error("Error retrieving countries:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.post("/add", async (req, res) => {
    const title = req.body.title;
    const description = req.body.description;
    const picture = req.body.isbn;

    await db.query("INSERT INTO books (title, description, picture) VALUES ($1, $2, $3)", [title, description, picture]);
    res.redirect("/");
});

app.post("/edit", async (req, res) => {
    const id = req.body.updatedBookId;
    const title = req.body.updatedBookTitle;
    const description = req.body.updatedBookDescription;
    const picture = req.body.updatedBookPicture;
    try{
      await db.query("UPDATE books SET title = ($2), description = ($3), picture = ($4) WHERE id = ($1);", [
        id, title, description, picture
      ]);
      res.redirect("/");
    }catch(error){
      console.log(error);
      res.status(500).send("Internal Server Error");
    }
  });

app.post("/delete", async (req, res) => {
    const id = req.body.deleteBookId;
  
    try{
      await db.query("DELETE FROM books WHERE id = ($1);", [
        id
      ]);
      res.redirect("/");
    }catch(error){
      console.log(error);
      res.status(500).send("Internal Server Error");
    }
  });

process.on('SIGINT', () => {
  db.end();
  console.log('Database connection closed due to app termination');
  process.exit(0);
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});