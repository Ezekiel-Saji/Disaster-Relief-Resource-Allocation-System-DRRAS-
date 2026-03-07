// resource-requests.js

document.addEventListener('DOMContentLoaded', () => {
    loadSelectOptions();
    loadRequestsTable();

    document.getElementById('requestForm').addEventListener('submit', handleNewRequest);
});

function loadSelectOptions() {
    const areas = JSON.parse(localStorage.getItem('drras_areas') || '[]');
    const resources = JSON.parse(localStorage.getItem('drras_resources') || '[]');

    const areaSelect = document.getElementById('areaId');
    areas.forEach(a => {
        const option = document.createElement('option');
        option.value = a.id;
        option.textContent = `${a.id} - ${a.name}`;
        areaSelect.appendChild(option);
    });

    const resourceSelect = document.getElementById('resourceId');
    resources.forEach(r => {
        const option = document.createElement('option');
        option.value = r.id;
        option.textContent = r.name;
        resourceSelect.appendChild(option);
    });
}

function loadRequestsTable() {
    const requests = JSON.parse(localStorage.getItem('drras_requests') || '[]');
    const tbody = document.getElementById('requestsList');

    // Sort by date newest first
    requests.sort((a, b) => new Date(b.date) - new Date(a.date));

    tbody.innerHTML = '';

    if (requests.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center">No requests recorded.</td></tr>`;
        return;
    }

    requests.forEach(req => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${req.id}</strong></td>
            <td>${req.areaId}</td>
            <td>${req.resourceName}</td>
            <td>${req.quantity.toLocaleString()}</td>
            <td>${req.date}</td>
            <td>${getStatusBadge(req.status)}</td>
        `;
        tbody.appendChild(tr);
    });
}

function handleNewRequest(e) {
    e.preventDefault();

    const areaId = document.getElementById('areaId').value;
    const resourceId = document.getElementById('resourceId').value;
    const quantity = parseInt(document.getElementById('quantity').value, 10);

    const resources = JSON.parse(localStorage.getItem('drras_resources') || '[]');
    const resourceName = resources.find(r => r.id === resourceId)?.name || resourceId;

    const newRequest = {
        id: generateId('REQ'),
        areaId,
        resourceId,
        resourceName,
        quantity,
        date: getTodayDateString(),
        status: 'Pending'
    };

    const requests = JSON.parse(localStorage.getItem('drras_requests') || '[]');
    requests.push(newRequest);
    localStorage.setItem('drras_requests', JSON.stringify(requests));

    // Reset form and reload table
    document.getElementById('requestForm').reset();
    loadRequestsTable();

    alert(`Request ${newRequest.id} successfully created!`);
}
