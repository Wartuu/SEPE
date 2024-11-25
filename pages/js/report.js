const printAllButton = document.getElementById("print-all");
const printButtons = document.getElementsByClassName("printButton");


const modalPrint = new bootstrap.Modal(document.getElementById("modalPrint"));
const printId = document.getElementById("print-id");
const printYear = document.getElementById("print-year");
const printMonth = document.getElementById("print-month");
const printRedirectButton = document.getElementById("print-data");




printYear.value = new Date().getFullYear();
printMonth.value = new Date().getUTCMonth() + 1;


const modalPrintAll = new bootstrap.Modal(document.getElementById("modalPrintAll"));
const printAllRedirectButton = document.getElementById("printall-data");
const printAllYear = document.getElementById("printall-year");
const printAllMonth = document.getElementById("printall-month");

printAllMonth.value = new Date().getUTCMonth() + 1;
printAllYear.value = new Date().getFullYear();

for(let i = 2020; i <= new Date().getFullYear()+1; i++) {
    let selected = i === new Date().getFullYear() ? "selected" : "";
    printAllYear.innerHTML += `
        <option value="${i}" ${selected}>${i}</option>
    `
}

for(let i = 0; i < 12; i++) {
    let selected = i === new Date().getMonth() ? "selected" : "";
    let plName = new Date(0, i).toLocaleString('pl-PL', { month: 'long'})
    printAllMonth.innerHTML += `
        <option value="${i+1}" ${selected}>${plName}</option>
    `

}

for(let i = 2020; i <= new Date().getFullYear()+1; i++) {
    let selected = i === new Date().getFullYear() ? "selected" : "";
    printYear.innerHTML += `
        <option value="${i}" ${selected}>${i}</option>
    `
}

for(let i = 0; i < 12; i++) {
    let selected = i === new Date().getMonth() ? "selected" : "";
    let plName = new Date(0, i).toLocaleString('pl-PL', { month: 'long'})
    printMonth.innerHTML += `
        <option value="${i+1}" ${selected}>${plName}</option>
    `

}

printAllButton.addEventListener('click', () => {
    modalPrintAll.show();


    console.log(printAllYear.value);
    console.log(printAllMonth.value);
})



for(let i = 0; i < printButtons.length; i++) {
    printButtons[i].addEventListener('click', (e) => {
        let btn = e.currentTarget;
        printId.value = btn.getAttribute('data-id');
        modalPrint.show();
    })
}

function openPrintWindow(url) {
    const printWindow = window.open(url, '_blank', 'width=800,height=600');

    if(printWindow) {
        printWindow.onload = () => {
            printWindow.print();
        }
    } else {
        alert('Zezwól na wyskakujące okna!')
    }
}

printRedirectButton.addEventListener('click', () => {
    if(printMonth.value >= 1 && printMonth.value <= 12 && printYear.value > 0) {
        openPrintWindow(`/api/v1/report/${printId.value}/${printMonth.value}/${printYear.value}`);
    }
})

printAllRedirectButton.addEventListener('click', () => {
    if(printAllMonth.value >= 1 && printAllMonth.value <= 12 && printAllYear.value > 0) {
        openPrintWindow(`/api/v1/report/all/${printAllMonth.value}/${printAllYear.value}`);
    }
})