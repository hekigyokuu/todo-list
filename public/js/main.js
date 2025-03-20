document.addEventListener("DOMContentLoaded", () => {
    // Handle complete button
    let taskIDs = {}

    fetch("/get-data")
        .then(res => res.json())
        .then(data => {
            taskIDs = Object.keys(data.tasks);
            console.log(taskIDs);
            
            let usernameTextLabel = document.getElementById("username");
            usernameTextLabel.innerText = `Welcome, ${data.username}`;
            updatePoints(data.points);

            let counter = 1;
            for (let id of taskIDs) {
                console.log(id);

                insertTableRow(data.tasks[id], counter, id);
                counter++;

                /*
                let completed = data.tasks[id].completed;

                if (completed) {
                    updateTable(id);            
                    document.getElementById(id).disabled = true;
                }
                */
                
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
                            if (data) {
                                updatePoints(data.points);
                                updateTable(id);
                                button.disabled = true;
                            }
                        })
                        .catch(error => console.log(error));
                });
            }
        })
        .catch(error => console.log(error));
});

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

    no.textContent = counter;
    instruction.textContent = task.instruction;
    status.textContent = task.completed ? "Completed" : "Incomplete";
    reward.textContent = task.reward;

    const button = document.createElement("button");
    button.textContent = "Completed";
    button.disabled = task.completed ? true : false;
    button.setAttribute("id", id);

    completed.appendChild(button);
}

window.addEventListener("load", function () {
    setTimeout(() => {
        let sound = new Audio("../sfx/sfx.mp3");
        sound.playbackRate = 1.5;
        sound.play().catch(error => console.log("Audio play failed:", error));
    }, 700)
});

