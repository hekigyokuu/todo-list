// Handle data loading
document.addEventListener("DOMContentLoaded", () => {
    // Handle complete button
    let taskIDs = {}

    fetch("/get-data")
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                taskIDs = Object.keys(data.tasks);
                console.log(taskIDs);
                
                let usernameTextLabel = document.getElementById("username");
                usernameTextLabel.innerText = `userStatus(${data.username})`;
                updatePoints(data.points);

                let counter = 1;
                for (let id of taskIDs) {
                    console.log(id);

                    insertTableRow(data.tasks[id], counter, id);
                    counter++;
                }
                return;
            }
            console.log("Error: No data found.")
        })
        .catch(error => console.log(error))                
});

// Handles add task action
document.getElementById("add-task").addEventListener("click", () => {
    const taskContainer = document.getElementById("task-container");

    const addTaskGui = document.createElement("div");
    addTaskGui.className = "add-task-container"; 
    addTaskGui.id = "add-task-container";
    addTaskGui.innerHTML = `<h3>System: Add task?</h3>
                            <form id="add-task-form">
                                <input name="instruction" placeholder="add new task" autocomplete="off" autofocus type="text">
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
    addTaskGui.innerHTML = `<h3>System: Clear all?</h3>
                                <form id="clear-task-form">
                                        <div class="button clear-task-button">
                                            <input name="action" value="yes" type="submit">
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

function completeTaskEventListener(id) {
    document.getElementById(id).addEventListener("click", () => {
        console.log(id);

        const button = document.getElementById(id);
        
        const data = { id: id }
    
        const options = {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        };

        fetch("/complete-task", options)
            .then(res => res.json())
            .then(data => { 
                if (data.success) {
                    updatePoints(data.points);
                    updateTable(id);
                    button.disabled = true;
                }
            })
            .catch(error => console.log(error));
    });
}

function removeTaskEventListener(id) {
    document.getElementById(id).addEventListener("click", (event) => {
        console.log(id);

        let icon = event.target;
        
        const data = { id: id }
    
        const options = {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(data)
        };

        fetch("/remove-task", options)
            .then(res => res.json())
            .then(data => { 
                console.log(data);
                if (data.removed) {
                    removeTableRow(icon);
                }
            })
            .catch(error => console.log(error));
    });
}

function updatePoints(amount) {
    let pointsTextLabel = document.getElementById("points")
    pointsTextLabel.innerText = amount;
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
    const complete = row.insertCell(4);
    const remove = row.insertCell(5);

    no.textContent = counter + ":";
    instruction.textContent = task.instruction;
    status.textContent = task.completed ? "Completed" : "Pending";
    reward.textContent = `??pts`;

    // Complete button
    const completeId = `complete-${id}`;
    const completeButton = document.createElement("button");
    completeButton.disabled = task.completed ? true : false;
    completeButton.setAttribute("id", completeId);

    const checkIcon = document.createElement("i");
    checkIcon.className = "fa-solid fa-check white-icon"
    completeButton.appendChild(checkIcon);
    complete.appendChild(completeButton);

    // Remove button
    const removeId = `remove-${id}`;
    const xIcon = document.createElement("i");
    xIcon.className = "fa-solid fa-xmark";
    xIcon.setAttribute("id", removeId);
    remove.appendChild(xIcon);

    completeTaskEventListener(completeId);
    removeTaskEventListener(removeId);
}

function removeTableRow(icon) {
    const tr = icon.closest("tr");

    if (tr) {
        tr.remove();
    }
}

function clearTable() {
    const tbody = document.getElementById("task-body");
    tbody.innerHTML = "";
}

