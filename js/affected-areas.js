// affected-areas.js

document.addEventListener('DOMContentLoaded', () => {
    loadAffectedAreas();
});

function loadAffectedAreas() {
    const areas = JSON.parse(localStorage.getItem('drras_areas') || '[]');
    const tbody = document.getElementById('areasList');

    tbody.innerHTML = '';

    if (areas.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center">No affected areas recorded.</td></tr>`;
        return;
    }

    areas.forEach(area => {
        const severityClass = area.severityScore >= 8 ? 'color: var(--alert-danger); font-weight: bold;' :
            (area.severityScore >= 6 ? 'color: var(--alert-warning); font-weight: bold;' : '');

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${area.id}</strong></td>
            <td>${area.disasterId}</td>
            <td>${area.name}</td>
            <td>${area.population.toLocaleString()}</td>
            <td style="${severityClass}">${area.severityScore}/10</td>
            <td>${area.lastAssistance}</td>
        `;
        tbody.appendChild(tr);
    });
}
