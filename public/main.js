// Handle complete button
let taskIDs = {}

fetch("/get-data")
    .then(res => res.json())
    .then(data => {
        taskIDs = Object.keys(data.tasks);
        console.log(taskIDs);

        for (let id of taskIDs) {
            console.log(id);

            document.getElementById(id).addEventListener("click", (event) => {
                console.log(id);
                
                let button = event.target;
                
                const data = {
                    id: id,
                }
            
                const options = {
                    method: "POST",
                    headers: {"Content-Type": "application/json"},
                    body: JSON.stringify(data)
                };

                fetch("/completed", options)
                    .then(res => res.json())
                    .then(data => {                        
                        let completed = data.tasks[id].completed;

                        if (!completed) {
                            updatePoints(completed, data.points, id);
                            button.disabled = true;
                        }
                    })
                    .catch(error => console.log(error));
            });
        }
    })
    .catch(error => console.log(error));


function updatePoints(completed, amount, id) {
    let pointsTextLabel = document.getElementById("points")

    if (completed) return; // Prevent user from the udpating data again

    pointsTextLabel.innerText = `${amount} pts`;

    const data = {
        amount: amount,
        id: id,
    }

    const options = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(data)
    };

    fetch("/set-data",options) 
        .then(res => res.json())
        .then(data => console.log(data.message))
        .catch(error => console.log(error));
}
