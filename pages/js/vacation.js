let toggleButtons = document.getElementsByClassName("toggle-vacation");
let deleteButtons = document.getElementsByClassName("delete-vacation");

for(let i = 0; i < toggleButtons.length; i++) {
    toggleButtons[i].addEventListener("click", async (e) => {
        let id = parseInt(e.target.getAttribute("data-id"));
        
        var confirmationDiv = document.getElementById("confirmation-" + id);
        var confirmation = confirmationDiv.innerHTML.includes("nie zatwierdzony");

        let request = await fetch('/api/v1/calendar/vacation/setConfirmation', {
            headers: {
                "Content-Type": "application/json"
            },
            method: "POST",
                body: JSON.stringify({
                    id: id,
                    confirmation: confirmation
                })
            }
        );


        if(await request.text() === "ok") {

            confirmationDiv.innerHTML = confirmation ? "zatwierdzony" : "nie zatwierdzony";
            e.target.classList.remove(confirmation ? "btn-primary" : "btn-danger");
            e.target.classList.add(confirmation ? "btn-danger" : "btn-primary");

            e.target.innerHTML = confirmation ? "Cofnij" : "Zatwierdź";
        }
    })
}


for(let i = 0; i < deleteButtons.length; i++) {
    deleteButtons[i].addEventListener('click', async (e) => {
        let id = e.currentTarget.getAttribute("data-id");

        let request = await fetch('/api/v1/calendar/vacation/remove', {
            headers: {
                "Content-Type": "application/json"
            },
            method: "POST",
            body: JSON.stringify({
                id: id,
            })
        })

        let output = await request.text();

        if(output === "ok") {
            document.getElementById("row-" + id).remove();
        }
         
    })
}