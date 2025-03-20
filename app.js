const bcrypt = require("bcryptjs");
const express = require("express");
const session = require("express-session");
const path = require("path");
const { MongoClient } = require("mongodb");
const { connectDB, insertData, getData, updateData, deleteData } = require("./mongo");

const uri = "mongodb://localhost:27017/";
const client = new MongoClient(uri);
connectDB(client);

const port = 3000;

const app = express();

app.use(session({
    secret: "verysecurepassword12345",
    resave: false,
    saveUninitialized: true
}));

app.use((req, res, next) => {
    if (!req.session.user) {
        req.session.user = {};  // Default empty session data
    }
    next();
});


app.get(["/", "/index.html", "/html/todo.html"], async (req, res, next) => {
    if (req.session.user.username) {
        return next();
    }
    
    console.log("Redirecting to login.html");
    return res.redirect("/html/login.html");
});


app.use(express.static(path.join(__dirname, "public"))); // Allow access to static files from "public" folder
app.use(express.urlencoded({ extended: true })); // Parse form data from client   
app.use(express.json()); // Parse JSON data from client

app.post("/login", async (req, res) => {
    const {username, password } = req.body;

    req.session.user = {};
    const userData = await getData(client, "todolist", "todolist", { username: username });

    if (userData.length === 0) {
        console.log("Login Failed: User not found.");
        return res.redirect("/html/login.html");
    }

    const hashedPassword = userData[0].password;
    const match = await bcrypt.compare(password, hashedPassword);

    if (match) {
        req.session.user.username = username;

        console.log("Success: " + username + " logged in.");
        return res.redirect("index.html");
    }

    return res.redirect("/html/login.html");
});

app.post("/register", async (req, res) => {
    const { username, password, confirmation } = req.body;
    let userData = await getData(client, "todolist", "todolist", { username: username });

    if (password !== confirmation) {
        console.log("Registration Failed: Password confirmation failed."); 
        return res.redirect("/html/register.html");
    }

    
    if (userData.length === 0) {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // pre-determined task data are just for testing
        const data = {
            username: username,
            password: hashedPassword,
            points: 0,
            tasks: {
                "task1": { completed: false, reward: 5 },
                "task2": { completed: false, reward: 10 }
            }
        };

        await insertData(client, "todolist", "todolist", data);

        return res.redirect("/html/login.html");
    }
    
    console.log("User data already exist");
    return res.redirect("/html/register.html");
});

app.get("/get-data", async (req, res) => {
    let filter = { username: req.session.user.username };

    let userData = await getData(client, "todolist", "todolist", filter);

    if (userData && userData.length > 0) {
        const data = {
            username: userData[0].username,
            points: userData[0].points,
            tasks: userData[0].tasks
        }

        return res.json(data);
    } 

    return res.status(404).json({ message: "No data found for the user" });
});

app.post("/completed", async (req, res) => {
    const { id } = req.body;

    let filter = { username: req.session.user.username };

    let userData = await getData(client, "todolist", "todolist", filter);
    userData = userData[0];

    if (userData.tasks[id].completed) {
        return res.json({});
    }
    
    userData.points += userData.tasks[id].reward;
    userData.tasks[id].completed = true;

    let update = { 
        $set: { points: userData.points, tasks: userData.tasks}
    };

    await updateData(client, "todolist", "todolist", filter, update);
    
    console.log("Data updated");

    const data = {
        points: userData.points
    }
    return res.json(data);
});

app.listen(port, (err) => {
    if (err) console.log("Bruh");

    console.log("port: " + port);
})
