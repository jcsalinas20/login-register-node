const express = require("express")
const bodyParser = require("body-parser")
const app = express()

if (typeof localStorage === "undefined" || localStorage === null) {
    var LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./scratch');
}
console.log("localStorage", JSON.parse(localStorage.getItem('users')));

app.use(bodyParser.json())
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
)
app.set("view engine", "ejs");

app.use(function (req, res, next) {
    res.setHeader("Access-Control-Allow-Origin", "*")
    res.setHeader("Access-Control-Allow-Credentials", "true")
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT")
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers"
    )
    next();
})

app.get("/", (req, res) => {
    res.render("index")
    res.end();
})

app.get("/login", (req, res) => {
    res.render("login")
    res.end();
})

app.post("/login", (req, res) => {
    var user = req.body.user;
    var pass = req.body.pass;

    let users = JSON.parse(localStorage.getItem('users'));
    if (users[user] == pass) res.redirect(`login?type=success&msg=Bienvenido ${user}.`);
    else res.redirect(`login?type=error&msg=No se ha encontrado el usuario: ${user}.`);
})


app.get("/register", (req, res) => {
    res.render("register")
    res.end();
})

app.post("/register", (req, res) => {
    var user = req.body.user;
    var pass = req.body.pass;
    var pass2 = req.body.pass2;

    if (pass == pass2) {
        let users = JSON.parse(localStorage.getItem('users'));
        users[user] = pass;
        localStorage.setItem('users', JSON.stringify(users));
        res.redirect('register?type=success&msg=Usuario registrado correctamente.');
    } else res.redirect('register?type=error&msg=Las contraseñas no son iguales.');
})

app.listen("1337", async () => {
    console.log("API REST corriendo en el puerto 1337");
});