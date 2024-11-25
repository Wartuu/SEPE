const addTimeButtons = document.getElementsByClassName("add-days");

const modalUpdate = new bootstrap.Modal(document.getElementById("modalUpdate"));
const addTimeValue = document.getElementById("update-days");
const addTimeId = document.getElementById("update-id");
const modalPostButton = document.getElementById("update-data");

for(let i = 0; i < addTimeButtons.length; i++) {
    addTimeButtons[i].addEventListener('click', (v) => {
        let id = v.currentTarget.getAttribute("data-id");
        let days = document.getElementById("days-" + id);
        addTimeValue.value = Number(days.innerHTML);
        addTimeId.value = id;
        modalUpdate.show();
    });
}


modalPostButton.addEventListener('click', async () => {
    let time = Number(addTimeValue.value);
    let id = addTimeId.value;


    console.log(time);
    if(!Number.isInteger(time) || time < 0) {
        return;
    }

    let request = await fetch("/api/v1/calendar/vacation/setDays", {
        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({id: id, days: time})
    })

    let output = await request.text();

    if(output === "ok") {
        document.getElementById("days-" + id).innerHTML = time;
        modalUpdate.hide();
    }

})