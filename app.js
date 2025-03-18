const express = require("express");
const path = require("path");

const port = 3000;

// Should use sql or nosql databases instead of local object/dictionary (palitan siguro natin next time)
// Example of userData fetched from a nosql database for use in the program:
let playerData = {
    points: 0,
    tasks: {
        "task1": { completed: false , reward: 5},
        "task2": { completed: false , reward: 10}
    } 
}

const app = express();

app.use(express.static(path.join(__dirname, "public"))); // Allow access to static files from "public" folder
app.use(express.json()); // Parse incoming JSON data from client

app.get("/get-data", (req, res) => {
    res.json(playerData);
});

app.post("/completed", (req, res) => {
    const data = req.body;
    const id = data.id;

    playerData.points += playerData.tasks[id].reward;

    res.json(playerData);
});

app.post("/set-data", (req, res) => {
    const data = req.body;
    const id = data.id

    playerData.points = data.amount;
    playerData.tasks[id].completed = true;

    res.json({message: "Data updataed"});
});

app.listen(port, (err) => {
    if (err) console.log("Bruh");

    console.log("port: " + port);
})
