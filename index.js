const express = require("express");
const app = express();
const PORT = 3000;
const mysql = require("mysql2");

//MIDDLEWARES
app.use(express.json());

//ENDPOINTS

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "mySql.1234",
  database: "expressDB",
});
db.connect();

//Crear la base de datos
app.get("/createdb", (req, res) => {
  let sql = "CREATE DATABASE expressDB";
  db.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send("Database created...");
  });
});

// crear la tabla products
app.get("/createproductstable", (req, res) => {
  let sql =
    "CREATE TABLE products(id int AUTO_INCREMENT,title VARCHAR(255), body VARCHAR(255), PRIMARY KEY(id))";
  db.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send("Products table created...");
  });
});

//crear la tabla categories
app.get("/createcategoriestable", (req, res) => {
  let sql =
    "CREATE TABLE categories(id int AUTO_INCREMENT,name VARCHAR(50), PRIMARY KEY(id))";
  db.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send("Categories table created...");
  });
});

//crear la tabla intermedia catalogo-productos
app.get("/createcat_prod", (req, res) => {
  let sql =
    "CREATE TABLE cat_prod(id int AUTO_INCREMENT, product_id INT, category_id INT, PRIMARY KEY(id), FOREIGN KEY(product_id) REFERENCES expressDB.products(id), FOREIGN KEY(category_id) REFERENCES expressDB.categories(id) )";
  db.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send("cat_prod intermediate table created...");
  });
});

//endpoint para añadir producto nuevo
app.post("/products", (req, res) => {
  let sql = `INSERT INTO products (title, body) values 
    ('${req.body.title}', '${req.body.body}');`;
  db.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send("Product added...");
  });
});

//endpoint para añadir categoria nueva
app.post("/categories", (req, res) => {
  let sql = `INSERT INTO categories (name) values 
      ('${req.body.name}');`;
  db.query(sql, (err, result) => {
    if (err) throw err;
    console.log(result);
    res.send("Category added...");
  });
});

//endpoint para actualizar producto
app.put("/updateproducts/id/:id", (req, res) => {
  let newTitle = req.body.title;
  let newBody = req.body.body;
  let sql = `UPDATE products SET title = '${newTitle}', body = '${newBody}' WHERE id = ${req.params.id} `;
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send("Product updated...");
  });
});

//endpoint para actualizar categoria
app.put("/updatecategory/id/:id", (req, res) => {
  let newName = req.body.name;
  let sql = `UPDATE categories SET name = '${newName}' WHERE id = ${req.params.id} `;
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send("Category updated...");
  });
});

// endpoint para mostrar todos los productos
app.get("/products", (req, res) => {
  let sql = "SELECT * FROM products";
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

// endpoint para mostrar todos los productos
app.get("/categories", (req, res) => {
    let sql = "SELECT * FROM categories";
    db.query(sql, (err, result) => {
      if (err) throw err;
      res.send(result);
    });
  });

// enpoint para mostrar todos los products con sus categorias
app.get("/cat_prod", (req, res) => {
    // let sql = "SELECT * FROM categories";
    // `UPDATE categories SET name = '${newName}' WHERE id = ${req.params.id} `
    let sql = `SELECT products.title, categories.name FROM cat_prod 
    INNER JOIN products ON categories.id = cat_prod.category_id
    INNER JOIN expressDB.products ON products.id = cat_prod.product_id;`;
    db.query(sql, (err, result) => {
      if (err) throw err;
      res.send(result);
    });
  });


// SELECT name_product, name_category FROM ecommerce.productoscategorias 
// INNER JOIN ecommerce.categories ON categories.id = productoscategorias.category_id
// INNER JOIN ecommerce.products ON products.id = productoscategorias.product_id;

//LISTEN PUERTO
app.listen(PORT, () => {
  console.log(`Servidor levantado en ${PORT} `);
});