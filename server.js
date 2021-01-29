const express = require("express");
const bodyParser = require("body-parser");
const low = require("lowdb");
const FileAsync = require("lowdb/adapters/FileAsync");
const {
  validateUsername,
  validateEmail,
  validatePassword,
} = require("./validators");

// Create server
const app = express();
app.use(bodyParser.json());

// Create database instance and start server
const adapter = new FileAsync("db.json");
low(adapter)
  .then((db) => {
    // Routes
    app.get("/", (req, res) => {
      res.send("Hello World!");
    });

    app.post("/register", async (req, res) => {
      const username = req.body.username;
      const email = req.body.email;
      const password = req.body.password;

      if (!validateUsername(username)) {
        res.send({ error: "invalid username" });
      } else if (!validateEmail(email)) {
        res.send({ error: "invalid email" });
      } else if (!validatePassword(password)) {
        res.send({ error: "invalid password" });
      } else {
        if (
          await db.get("users").find({ username: req.body.username }).value()
        ) {
          res.send({ error: "username already exists" });
        } else if (
          await db.get("users").find({ email: req.body.email }).value()
        ) {
          res.send({ error: "email is already linked to an account" });
        } else {
          db.get("users")
            .push({
              username,
              email,
              password,
            })
            .last()
            .assign({ id: Date.now().toString() })
            .write()
            .then((user) => res.send({ token: user.id }));
        }
      }
    });

    app.post("/login", async (req, res) => {
      const username = req.body.username;
      const email = req.body.email;
      const password = req.body.password;

      let user = await db
        .get("users")
        .find((u) => u.username === username || u.email === email)
        .value();

      if (user) {
        if (user.password === password) {
          res.send({ token: user.id });
        } else {
          res.send({ error: "wrong password" });
        }
      } else {
        res.send({ error: "user not found" });
      }
    });

    app.get("/me", async (req, res) => {
      const token = req.query.token;

      let user = await db.get("users").find({ id: token }).value();

      if (!user) {
        res.send({ error: "invalid token" });
      } else {
        res.send({
          id: user.id,
          username: user.username,
          email: user.email,
        });
      }
    });

    // GET /posts/:id
    // app.get("/posts/:id", (req, res) => {
    //   const post = db.get("posts").find({ id: req.params.id }).value();

    //   res.send(post);
    // });

    // POST /posts
    // app.post("/posts", (req, res) => {
    //   db.get("posts")
    //     .push(req.body)
    //     .last()
    //     .assign({ id: Date.now().toString() })
    //     .write()
    //     .then((post) => res.send(post));
    // });

    // Set db default values
    return db.defaults({ users: [] }).write();
  })
  .then(() => {
    app.listen(process.env.PORT || 3000, () => console.log("listening"));
  });
