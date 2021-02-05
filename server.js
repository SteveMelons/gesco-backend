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
      const familyDoctorName = req.body.familyDoctorName;
      const familyDoctorEmail = req.body.familyDoctorEmail;
      const phone = req.body.phone;
      const emergencyPhone = req.body.emergencyPhone;
      const password = req.body.password;
      const role = req.body.role;

      if (!validateUsername(username)) {
        res.status(400).send({ error: "invalid username" });
      } else if (!validateEmail(email)) {
        res.status(400).send({ error: "invalid email" });
      } else if (!validatePassword(password)) {
        res.status(400).send({ error: "invalid password" });
      } else {
        if (
          await db.get("users").find({ username: req.body.username }).value()
        ) {
          res.status(400).send({ error: "username already exists" });
        } else if (
          await db.get("users").find({ email: req.body.email }).value()
        ) {
          res
            .status(400)
            .send({ error: "email is already linked to an account" });
        } else {
          db.get("users")
            .push({
              username,
              email,
              familyDoctorName,
              familyDoctorEmail,
              phone,
              emergencyPhone,
              password,
              role,
            })
            .last()
            .assign({ id: Date.now().toString() })
            .write()
            .then((user) => res.send({ token: user.id, role: user.role }));
        }
      }
    });

    app.post("/login", async (req, res) => {
      const usernameOrEmail = req.body.usernameOrEmail;
      const password = req.body.password;

      let user = await db
        .get("users")
        .find(
          (u) => u.username === usernameOrEmail || u.email === usernameOrEmail
        )
        .value();

      if (user) {
        if (user.password === password) {
          res.send({ token: user.id, role: user.role });
        } else {
          res.status(400).send({ error: "wrong password" });
        }
      } else {
        res.status(400).send({ error: "user not found" });
      }
    });

    app.get("/me", async (req, res) => {
      const token = req.query.token;

      let user = await db.get("users").find({ id: token }).value();

      if (!user) {
        res.status(400).send({ error: "invalid token" });
      } else {
        res.send({
          id: user.id,
          username: user.username,
          email: user.email,
          familyDoctorName: user.familyDoctorName,
          familyDoctorEmail: user.familyDoctorEmail,
          phone: user.phone,
          emergencyPhone: user.emergencyPhone,
          role: user.role,
        });
      }
    });

    // Set db default values
    return db
      .defaults({
        users: [
          {
            id: "126451265412",
            username: "bobby12",
            email: "bob@bob.com",
            familyDoctorName: "John Meyer",
            familyDoctorEmail: "john@meyer.com",
            phone: "2039481028",
            emergencyPhone: "2039412478",
            password: "bobby12",
            role: "patient",
          },
          {
            id: "48065478357315",
            username: "tommy12",
            email: "tom@tom.com",
            phone: "2035464628",
            password: "tommy12",
            role: "doctor",
          },
        ],
      })
      .write();
  })
  .then(() => {
    app.listen(process.env.PORT || 3000, () => console.log("listening"));
  });
