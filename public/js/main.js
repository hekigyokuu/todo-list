// Handle data loading
document.addEventListener("DOMContentLoaded", () => {
    // Handle complete button
    let taskIDs = {}

    fetch("/get-data")
        .then(res => res.json())
        .then(data => {
            taskIDs = Object.keys(data.tasks);
            console.log(taskIDs);
            
            let usernameTextLabel = document.getElementById("username");
            usernameTextLabel.innerText = `Welcome, ${data.username}!`;
            updatePoints(data.points);

            let counter = 1;
            for (let id of taskIDs) {
                console.log(id);

                insertTableRow(data.tasks[id], counter, id);
                counter++;
                
                addTaskButtonEventListener(id);
            }
        })
        .catch(error => console.log(error));
});

// Handles add task action
document.getElementById("add-task").addEventListener("click", () => {
    const taskContainer = document.getElementById("task-container");

    const addTaskGui = document.createElement("div");
    addTaskGui.className = "add-task-container"; 
    addTaskGui.id = "add-task-container";
    addTaskGui.innerHTML = `<h3>Adding a task to the system</h3>
                                <form id="add-task-form">
                                    <input name="instruction" placeholder="Instruction" autocomplete="off" type="text">
                                        <div class="button">
                                            <input name="add" value="Add" type="submit">
                                        </div>
                                </form>`;
    
    taskContainer.appendChild(addTaskGui);

    document.getElementById("add-task-form").addEventListener("submit", (e) => {
        e.preventDefault(); // Prevent page to reload when form was submitted 

        const formData = new FormData(e.target);
        const jsonObject = Object.fromEntries(formData.entries());

        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(jsonObject)
        }

        fetch("/add-task", options)
            .then(res => res.json())
            .then(data => {
                insertTableRow(data.task, data.count, data.id);
            });

        const addTaskGui = document.getElementById("add-task-container");
        if (addTaskGui) {
            addTaskGui.remove();
        }

    });
});

// Handles clear all action
document.getElementById("clear-task").addEventListener("click", () => {
    const taskContainer = document.getElementById("task-container");

    const addTaskGui = document.createElement("div");
    addTaskGui.className = "add-task-container"; 
    addTaskGui.id = "add-task-container";
    addTaskGui.innerHTML = `<h3>Are you sure you want to clear all task?</h3>
                                <form id="clear-task-form">
                                        <div class="button">
                                            <input name="action" value="yes" type="submit">
                                        </div>
                                        <div class="button">
                                            <input name="action" value="no" type="submit">
                                        </div>
                                </form>`;
    
    taskContainer.appendChild(addTaskGui);

    document.getElementById("clear-task-form").addEventListener("submit", (e) => {
        e.preventDefault(); // Prevent page to reload when form was submitted 

        const action = e.submitter.value;

        const options = {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action })
        }

        fetch("/clear-task", options)
            .then(res => res.json())
            .then(data => {
                if (data.cleared) {
                    clearTable();
                }
            });

        const addTaskGui = document.getElementById("add-task-container");
        if (addTaskGui) {
            addTaskGui.remove();
        }
    });
});

window.addEventListener("load", function () {
    setTimeout(() => {
        let sound = new Audio("../sfx/sfx.mp3");
        sound.playbackRate = 1.5;
        sound.play().catch(error => console.log("Audio play failed:", error));
    }, 700)
});

function addTaskButtonEventListener(id) {
    document.getElementById(id).addEventListener("click", (event) => {
        console.log(id);

        let button = event.target;
        
        const data = {
            id: id
        }
    
        const options = {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        };

        fetch("/completed", options)
            .then(res => res.json())
            .then(data => { 
                console.log(data);
                if (Object.keys(data).length > 0) {
                    updatePoints(data.points);
                    updateTable(id);
                    button.disabled = true;
                }
            })
            .catch(error => console.log(error));
    });
}

function updatePoints(amount) {
    let pointsTextLabel = document.getElementById("points")
    pointsTextLabel.innerText = `${amount} pts`;
}

function updateTable(id) {
    let tr =  document.getElementById(id).parentElement.parentElement;
    let tdElements = tr.children;   
    tdElements[2].textContent = "Completed";
}

function insertTableRow(task, counter, id) {
    const tbody = document.getElementById("task-body");
    const row = tbody.insertRow();

    const no = row.insertCell(0);
    const instruction = row.insertCell(1);
    const status = row.insertCell(2);
    const reward = row.insertCell(3);
    const completed = row.insertCell(4);

    no.textContent = "Task " + counter + ":";
    instruction.textContent = task.instruction;
    status.textContent = task.completed ? "Completed" : "Incomplete";
    reward.textContent = `+${task.reward}pts`;

    const button = document.createElement("button");
    button.disabled = task.completed ? true : false;
    button.setAttribute("id", id);
    
    const checkIcon = document.createElement("i");
    checkIcon.className = "fa-solid fa-check white-icon"

    button.appendChild(checkIcon);
    completed.appendChild(button);

    addTaskButtonEventListener(id);
}

function clearTable() {
    const tbody = document.getElementById("task-body");
    tbody.innerHTML = "";
}
