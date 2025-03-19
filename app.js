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

app.get("/", async (req, res) => {
    // Hardcode username (will be dynamic when implemented login/register system)
    let username = "Jinwoo";
    req.session.user = {};
    req.session.user.username = username;
    console.log("Welcome " + username);

    // RECREATE USER DATA EVERY RESTART (For testing)
    // Hardcoded data for testing
    const data = {
        username: "Jinwoo",
        points: 0,
        tasks: {
            "task1": { completed: false, reward: 5 },
            "task2": { completed: false, reward: 10 }
        }
    }
    await deleteData(client, "todolist", "todolist", {}, true); // Clear database
    await insertData(client, "todolist", "todolist", data);     // Insert user to database

    res.redirect("index.html");
});

app.use(express.static(path.join(__dirname, "public"))); // Allow access to static files from "public" folder
app.use(express.json()); // Parse incoming JSON data from client

app.get("/get-data", async (req, res) => {
    let filter = { username: req.session.user.username };

    let userData = await getData(client, "todolist", "todolist", filter);

    if (userData && userData.length > 0) {
        res.json(userData[0]);
    } else {
        res.status(404).json({ message: "No data found for the user" });
    }
});

app.post("/completed", async (req, res) => {
    const data = req.body;
    const id = data.id;

    let filter = { username: req.session.user.username };

    let userData = await getData(client, "todolist", "todolist", filter);
    userData = userData[0];

    if (userData.tasks[id].completed) {
        res.json({});
    }
    else {
        userData.points += userData.tasks[id].reward;
        userData.tasks[id].completed = true;
    
        let update = { 
            $set: { points: userData.points, tasks: userData.tasks}
        };
    
        await updateData(client, "todolist", "todolist", filter, update);
        
        console.log("Data updated");
    
        res.json(userData);
    
    }
});

app.listen(port, (err) => {
    if (err) console.log("Bruh");

    console.log("port: " + port);
})
