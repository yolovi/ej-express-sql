//TODO: EJERCICIOS QUE FALTAN:
//Crea un endpoint que muestre de forma descendente los productos.
//Ejercicios 1.2.MVC
//----------------------------------------------------

const express = require("express");
const app = express();
const PORT = 3000;
const mysql = require("mysql2");

// configuramos la conexion con la base de datos
const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "mySql.1234",
  database: "expressDB", // este punto se hace despues de crear la base de datos (el primer endpoint)
  // TODO:cambiar el nombre de la db por uno mas coherete greengrocerDB y en todas las partes que ponga expressDB
});

//establecemos la conexion con la base de datos
db.connect();

//MIDDLEWARES
app.use(express.json());

//RUTAS

//ENDPOINTS

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

// endpoint para mostrar todas las categorias
app.get("/categories", (req, res) => {
  let sql = "SELECT * FROM categories";
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

//ruta para insertar una relación en la tabla intermedia cat_prod
app.post("/cat_prod", (req, res) => {
  const { productId, categoryId } = req.body;

  const sql = "INSERT INTO cat_prod (product_id, category_id) VALUES (?, ?)"; // el ? es un marcador de posicion
  const values = [productId, categoryId]; //los valores reales

  db.query(sql, values, (err, result) => {
    if (err) {
      console.error("Error al ejecutar la consulta: ", err);
      res.status(500).send("Error en el servidor");
      return;
    }
    res.send({ msg: "Relación insertada correctamente ", result });
  });
});

//Los valores reales que se insertarán se representan mediante marcadores de posición ?. Los marcadores de posición se utilizan para evitar problemas de seguridad como la inyección de SQL y también permiten reutilizar la consulta.

// endpoint para mostrar todos los products con sus categorias
app.get("/cat_prod", (req, res) => {
  const sql = `SELECT products.title, categories.name FROM cat_prod 
    JOIN products ON cat_prod.product_id = products.id
    JOIN categories ON cat_prod.category_id = categories.id;`;
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});


//Crea un endpoint donde puedas buscar un producto por su nombre
app.get("/products/filter/title/:title", (req, res) => {
  // Ruta GET para filtrar productos por nombre

  const productTitle = req.params.title;
  // Utiliza una consulta SQL para filtrar los productos cuyo título coincida con "productTitle"
  const sql = `SELECT * FROM products WHERE LOWER(title) = LOWER(?)`;
  db.query(sql, [productTitle], (err, result) => {
    if (err) {
      // Si ocurre un error durante la consulta, se envía una respuesta con el código de estado 500 (Internal Server Error)
      console.error(err);
      res
        .status(500)
        .send({ error: "An error occurred while fetching products" });
    } else {
      if (result.length > 0) {
        // Si se encuentran productos, se envían los productos encontrados como respuesta
        res.send({ results: result });
      } else {
        // Si no se encuentran productos, se envía un mensaje de error con el código de estado 404 (Not Found)
        res
          .status(404)
          .send({ msg: `Product with title "${productTitle}" not found` });
      }
    }
  });
});

//Crea un endpoint donde puedas seleccionar una categoría por id
app.get("/categories/filter/id/:id", (req, res) => {
  const categoryId = req.params.id;
  const sql = "SELECT * FROM categories WHERE id = ?";
  db.query(sql, [categoryId], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).send({ msg: "Internal server error" });
              return;
    }
    if (results.length > 0) {
      const foundCategory = results[0];
      res.send({ Category: categoryId, result: foundCategory });
    } else {
      res.status(404).send({ msg: "Category not found" });
    }
  });
});

//FIXME: Crea un endpoint donde puedas eliminar un producto por su id // TODO: FALTA ON CASCADE ver repo
app.delete('/id/:id', (req, res) => {
  const productId = req.params.id;
  // Check if the product exists
  const checkQuery = 'SELECT * FROM products WHERE id = ?';
  db.query(checkQuery, [productId], (error, results) => {
    if (error) {
      console.error('Error querying the database:', error);
      res.status(500).send('CheckQuery Internal Server Error');
      return;
    }
    if (results.length === 0) {
      res.send(`Product with id ${productId} not found`);
    } else {
      // Delete the product
      const deleteQuery = 'DELETE FROM products WHERE id = ?';
      db.query(deleteQuery, [productId], (deleteError, deleteResults) => {
        if (deleteError) {
          console.error('Error deleting the product:', deleteError);
          res.status(500).send('Delete Internal Server Error');
          return;
        }
        res.send(`Product with id ${productId} deleted successfully`);
      });
    }
  });
});


//LISTEN PUERTO
app.listen(PORT, () => {
  console.log(`Servidor levantado en ${PORT} `);
});
