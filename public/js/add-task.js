document.getElementById("add-task").addEventListener("click", () => {
    const taskContainer = document.getElementById("task-container");

    const addTaskGui = document.createElement("div");
    addTaskGui.className = "add-task-container"; 
    addTaskGui.id = "add-task-container";
    addTaskGui.innerHTML = `<h3>Adding a task to the system</h3>
                                <form id="add-task-form">
                                    <input name="instruction" placeholder="Instruction" autocomplete="off" type="text">
                                        <div class="button">
                                            <input id="submit-task" name="add" value="add" type="submit">
                                        </div>
                                </form>`;
    
    taskContainer.appendChild(addTaskGui);

    document.getElementById("add-task-form").addEventListener("submit", (e) => {
        e.preventDefault(); // Prevent page to reload when form was submitted 

        const form = document.getElementById("add-task-form");
        const formData = new FormData(form);

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
}