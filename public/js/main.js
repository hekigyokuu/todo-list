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

            for (let id of taskIDs) {
                console.log(id);
                let completed = data.tasks[id].completed;

                if (completed) {
                    updateTable(id);            
                    document.getElementById(id).disabled = true;
                }

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