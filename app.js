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


app.get(["/", "/index.html"], async (req, res, next) => {
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
        req.session.user.taskCount = Object.keys(userData[0].tasks).length;

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
                "task1": { 
                    instruction: "Drink water", 
                    completed: false, 
                    reward: 5 
                },
                "task2": { 
                    instruction: "Walk 200 meters",
                    completed: false, 
                    reward: 10 
                }
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
    userData = userData[0];

    if (userData && Object.keys(userData).length > 0) {
        const data = {
            success: true,
            username: userData.username,
            points: userData.points,
            tasks: userData.tasks
        }

        return res.json(data);
    } 

    return res.json({ success: false });
});

app.post("/complete-task", async (req, res) => {
    let { id } = req.body;
    id = id.replace("complete-", "");

    let filter = { username: req.session.user.username };

    let userData = await getData(client, "todolist", "todolist", filter);
    userData = userData[0];

    const validTask = Object.keys(userData.tasks).includes(id);

    if (!validTask || userData.tasks[id].completed) {
        return res.json({ success: false });
    }
    
    userData.points += userData.tasks[id].reward;
    //userData.tasks[id].completed = true;

    let update = { 
        $set: { 
            points: userData.points, 
            [`tasks.${id}.completed`]: true 
        }
    };

    await updateData(client, "todolist", "todolist", filter, update);
    
    const data = { success: true, points: userData.points }
    return res.json(data);
});

app.post("/remove-task", async (req, res) => {
    let { id } = req.body;
    id = id.replace("remove-", "");
    console.log(id);
    
    let filter = { username: req.session.user.username };

    let userData = await getData(client, "todolist", "todolist", filter);
    userData = userData[0];

    const validTask = Object.keys(userData.tasks).includes(id);

    if (!validTask) {
        return res.json({});
    }

    let update = { 
        $unset: { [`tasks.${id}`]: true } 
    };

    await updateData(client, "todolist", "todolist", filter, update);
    
    console.log("Data updated");

    return res.json( {removed: true });
});

app.post("/add-task", async (req, res) => {
    const { instruction } = req.body;
    
    req.session.user.taskCount += 1;

    // Update data on the database
    const taskId = "task" + req.session.user.taskCount;
    const taskReward = (Math.floor(Math.random() * 4) + 1) * 5;  // Randomize reward: 5, 10, 15, or 20

    const filter = { username: req.session.user.username };

    let userData = await getData(client, "todolist", "todolist", filter);
    userData = userData[0];

    userData.tasks[taskId] = {
        instruction: instruction,
        completed: false,
        reward: taskReward
    }

    const update = { $set: { tasks: userData.tasks } };
    await updateData(client, "todolist", "todolist", filter, update);

    // Send data to client
    const clientData = {
        id: taskId,
        count: req.session.user.taskCount,
        task: {
            instruction: instruction,
            completed: false,
            reward: taskReward
        }
    };

    res.send(clientData)
});

app.post("/clear-task", async (req, res) => {
    const action = req.body.action;
        
    if (action === "yes") {
        req.session.user.taskCount = 0;
        
        const filter = { username: req.session.user.username };
        const update = { $set: {tasks: {} } };

        await updateData(client, "todolist", "todolist", filter, update);
        return res.json({cleared: true });
    }

    return res.json({cleared: false });
});

app.listen(port, (err) => {
    if (err) console.log("Bruh");

    console.log("port: " + port);
})
 