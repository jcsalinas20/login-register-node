const express = require("express")
const moment = require('moment');
const uuidv4 = require('uuid');
const sha1 = require('sha1');
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

app.post("/api/logout", (req, res) => {
    var username = req.body.user;
    var password = req.body.pass;
    var status = 0;
    var msg = "";

    let users = JSON.parse(localStorage.getItem('users'));
    users.map(function (user) {
        if (user.name === username && user.pass == password) {
            user.token = '';
            status = 1;
            msg = `Hasta otra ${username}.`;
        }
    });


    if (status) {
        localStorage.setItem('users', JSON.stringify(users));
        res.header("Content-Type", "application/json")
        res.send(
            JSON.stringify({
                type: "success",
                msg: msg
            }, null, 2)
        )
    } else {
        res.header("Content-Type", "application/json")
        res.send(
            JSON.stringify({
                type: "error",
                msg: `No se ha encontrado el usuario: ${username}.`
            }, null, 2)
        )
    }
});

app.post("/api/login", (req, res) => {
    var username = req.body.user;
    var password = req.body.pass;
    var status = 0;
    var msg = "";

    let users = JSON.parse(localStorage.getItem('users'));
    users.map(function (user) {
        if (user.name === username && user.pass == password) {
            const ORDER_ID = getOrderId()
            const TIMESTAMP = getMoment()
            status = 1;

            const token = createHash(
                ORDER_ID,
                TIMESTAMP,
                password
            )
            user.token = token;

            msg = `Bienvenido ${username} este es tu token: ${token}.`;
        }
    });


    if (status) {
        localStorage.setItem('users', JSON.stringify(users));
        res.header("Content-Type", "application/json")
        res.send(
            JSON.stringify({
                type: "success",
                msg: msg
            }, null, 2)
        )
    } else {
        res.header("Content-Type", "application/json")
        res.send(
            JSON.stringify({
                type: "error",
                msg: `No se ha encontrado el usuario: ${username}.`
            }, null, 2)
        )
    }
});

app.post("/api/register", (req, res) => {
    var username = req.body.user;
    var password = req.body.pass;

    let users = JSON.parse(localStorage.getItem('users'));
    let newUser = {
        name: username,
        pass: password,
        token: ''
    };
    users.push(newUser);

    localStorage.setItem('users', JSON.stringify(users));
    res.header("Content-Type", "application/json")
    res.send(
        JSON.stringify({
            type: "success",
            msg: `El usuario ${username} se ha registrado correctamente.`
        }, null, 2)
    )
});

app.listen("1337", async () => {
    console.log("API REST corriendo en el puerto 1337");
});


function createHash(...params) {
    const token = sha1(params.join("."))

    return token;
}

function getOrderId() {
    return uuidv4.v4();
}

function getMoment() {
    return moment().format("YYYYMMDDHHmmss");
}