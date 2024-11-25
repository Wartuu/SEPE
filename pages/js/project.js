const modalUpdate = new bootstrap.Modal(document.getElementById("modalUpdate"));
const modalUpdateId = document.getElementById("update-id");
const modalUpdateName = document.getElementById("update-name");
const modalUpdateColor = document.getElementById("update-color");
const modalUpdatePostButton = document.getElementById("update-data");
const modalUpdateAlert = document.getElementById("update-alert");

modalUpdateAlert.style.visibility = "hidden";

const modalDelete = new bootstrap.Modal(document.getElementById("modalDelete"));
const modalDeleteNameText = document.getElementById("deleteName");
const modalDeleteIdText = document.getElementById("deleteId");
const modalDeleteId = document.getElementById("delete-id");
const modalDeletePostButton = document.getElementById("delete-data");
const modalDeleteAlert = document.getElementById("delete-alert");
modalDeleteAlert.style.visibility = "hidden";


const modalCreate = new bootstrap.Modal(document.getElementById("modalCreate"));
const modalCreateName = document.getElementById("create-name");
const modalCreateColor = document.getElementById("create-color");
const modalCreatePostButton = document.getElementById("create-data");
const modalCreateAlert = document.getElementById("create-alert");

modalCreateAlert.style.visibility = "hidden";

const updateButtons = document.getElementsByClassName("action-update");
const deleteButtons = document.getElementsByClassName("action-delete");
const createButton = document.getElementById("action-create");
console.log(updateButtons);

for(let i = 0; i < updateButtons.length; i++) {
    updateButtons[i].addEventListener("click", (e) => {
        let btn = e.currentTarget;
        
        let id =  btn.getAttribute("data-id");
        let name = btn.getAttribute("data-name");
        let color = btn.getAttribute("data-color");

        modalUpdateId.value = id;
        modalUpdateName.value = name;
        modalUpdateColor.value = color;

        modalUpdate.show();
    })
}

for(let i = 0; i < deleteButtons.length; i++) {
    deleteButtons[i].addEventListener("click", (e) => {
        
        let btn = e.currentTarget;
        
        let id =  btn.getAttribute("data-id");
        let name = btn.getAttribute("data-name");
        let color = btn.getAttribute("data-color");

        modalDeleteNameText.innerHTML = name;
        modalDeleteIdText.innerHTML = id;
        modalDeleteId.value = id;
        modalDelete.show();
    })
}

createButton.addEventListener("click", (e) => {
    let btn = e.currentTarget;
        
    let id =  btn.getAttribute("data-id");
    let name = btn.getAttribute("data-name");
    let color = btn.getAttribute("data-color");

    modalCreate.show();
})


modalUpdatePostButton.addEventListener('click', async () => {
    
    let id = modalUpdateId.value;
    let name = modalUpdateName.value;
    let color = modalUpdateColor.value;

    if(name.length === 0) {
        modalUpdateAlert.innerHTML = "nazwa projektu musi mieć przynajmniej jeden znak"
        modalUpdateAlert.style.visibility = "visible";
        return;
    }
    
    const out = {
        id: id,
        name: name,
        color: color
    }

    var request = await fetch("/api/v1/project/update", {
        headers: {
            "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify(out)
    })

    modalUpdateAlert.style.visibility = "hidden";
    location.reload();
})

modalDeletePostButton.addEventListener('click', async () => {
    let id = modalDeleteId.value;
    
    const out = {
        id: id,
    }

    var request = await fetch("/api/v1/project/delete", {
        headers: {
            "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify(out)
    })

    let response = await request.json();
    if(!response.success) {
        modalDeleteAlert.innerHTML = "nie można usunąć, projekt jest używany przez inne zdarzenia";
        modalDeleteAlert.style.visibility = "visible";
    } else {
        location.reload();
    }
});

modalCreatePostButton.addEventListener('click', async () => {
    let name = modalCreateName.value;
    let color = modalCreateColor.value;

    const out = {
        name: name,
        color: color,
    }

    var request = await fetch("/api/v1/project/create", {
        headers: {
            "Content-Type": "application/json"
        },
        method: "POST",
        body: JSON.stringify(out)
    })

    let response = await request.text();

    if(response === "ok") {
        location.reload();
    } else {
        modalCreateAlert.innerHTML = "nie udało się utworzyć nowego projektu";
        modalCreateAlert.style.visibility = "visible";
    }
});