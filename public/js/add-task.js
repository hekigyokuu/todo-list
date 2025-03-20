document.getElementById("add-task").addEventListener("click", () => {
    const taskContainer = document.getElementById("task-container");

    const addTaskGui = document.createElement("div");
    addTaskGui.className = "add-task-container"; 
    addTaskGui.innerHTML = `<h3>Adding a task to the system</h3>
                                <!--action="/add-task" method="post"-->
                                <form>
                                    <input name="instruction" placeholder="Instruction" autocomplete="off" type="text">
                                        <div class="button">
                                            <input id="submit-task" name="add" value="add" type="submit">
                                        </div>
                                </form>`;

    taskContainer.appendChild(addTaskGui);
});