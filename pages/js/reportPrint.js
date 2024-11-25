const report = document.getElementById("report");

const getProjectById = (id) => {
    const item = projects.find(item => item.id === id);
    return item ? item : null;
}

events.sort((a, b) => {
    return new Date(a.start) - new Date(b.start);
});

users.forEach(u => {
    const pageDiv = document.createElement('div');

    pageDiv.className = 'page';
    pageDiv.id = `page-${u.id}`;

    pageDiv.textContent = 'User ID: ' + u.id;

    console.log(u.fullTime);


    let tableHTML = `
        <table class="header-table">
            <tr>
                <td class="logo-cell" rowspan="2">
                    <div style="display:flex; gap:15px; margin-left: 15px">
                    <img src="/png/reportLogo.png" alt="SEPE">
                    </div>
                </td>

                <td class="title-cell">
                Ewidencja czasu pracy
                </td>
                <td class="date-cell">${month}.${year}</td>
            </tr>
            <tr>
                <td colspan="1" class="name-cell"> ${u.name} </td>
                <td></td>
            </tr>
        </table>
    
        <table class="data-table">
            <tr>
                <th class="date-tr">Data</th>
                <th class="time-tr">Czas</th>
                <th class="description-tr">Zakres czynności</th>
                <th>Projekt</th>
            </tr>
    `

    let extra = 0;
    let hoursPerDay = 8*60;
    let dailyEventDurations = {};

    events.forEach(event => {
        if(event.user_id != u.id) {
            return;
        }

        let eventDateStart = new Date(event.start);
        console.log(eventDateStart);
        let date = eventDateStart.getFullYear() + '-' +
            String(eventDateStart.getMonth() + 1).padStart(2, '0') + '-' +
            String(eventDateStart.getDate()).padStart(2, '0');
        
        let durationInMilis = event.end - event.start;
        let totalMinutes = Math.floor(durationInMilis / (1000 * 60));

        dailyEventDurations[date] = (dailyEventDurations[date] || 0) + totalMinutes;

        console.log(totalMinutes);

        let hours = Math.floor(totalMinutes / 60);
        let minutes = totalMinutes % 60;

        if(minutes == 0) {
            minutes = "00";
        }
    
        timestamp = `<span class="time">${hours}</span><span class="minute">${minutes}</span>`
        
        tableHTML += `
        
            <tr class="data-row">
                <td> ${date} </td>
                <td> ${timestamp}</td>
                <td class="description"> ${event.description}</td>
                <td class="project"> ${getProjectById(event.project).name} </td>
            </tr>
        `;

    })

    tableHTML += `</table>`;


    let totalWork = 0;
    Object.values(dailyEventDurations).forEach(totalMinutesPerDay => {
        totalWork += totalMinutesPerDay;
        if (totalMinutesPerDay > hoursPerDay) {
            extra += totalMinutesPerDay - hoursPerDay;
        }
    });

    let extraHours = Math.floor(extra / 60);
    let extraMinutes = extra - (extraHours * 60);

    let totalWorkHours = Math.floor(totalWork / 60);
    let totalWorkMinutes = totalWork - (totalWorkHours * 60);

    if(u.fullTime) {
        tableHTML += `
        <table class="footer">
            <tr>
                <td> całkowity czas pracy: ${totalWorkHours}h ${totalWorkMinutes}min </td>
                <td> w tym nadgodziny: ${extraHours}h ${extraMinutes}min </td>
            </tr>
        </table>
        
        <div class="signature-parent">
            <div class="signature">
                <div class="signature-date">${new Date().toISOString().slice(0, 10)}</div><br>
                <div class="signature-info">Potwierdzam zgodność powyższej ewidencji z faktycznie wykonaną pracą. DATA I PODPIS PRACODAWCY</div>
            </div>
        </div>

        `;
    } else {
        tableHTML += `
        <table class="footer">
            <tr>
                <td> całkowity czas pracy: ${totalWorkHours}h ${totalWorkMinutes}min </td>
            </tr>
        </table>

        <div class="signature-parent">
            <div class="signature">
                <div class="signature-date">${new Date(year, month, 1).toISOString().slice(0, 10)}</div><br>
                <div class="signature-info">Potwierdzam zgodność powyższej ewidencji z faktycznie wykonaną pracą. DATA I PODPIS PRACODAWCY</div>
            </div>
        </div>
        `;
    }


    pageDiv.innerHTML = tableHTML;
    report.appendChild(pageDiv);
});


