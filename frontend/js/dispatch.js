// dispatch.js

document.addEventListener('DOMContentLoaded', () => {
    // Set default dates
    document.getElementById('dispatchDate').value = getTodayDateString();

    // Default ETA to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    document.getElementById('expectedDelivery').value = tomorrow.toISOString().split('T')[0];

    loadSelectOptions();
    loadDispatchesTable();

    document.getElementById('dispatchForm').addEventListener('submit', handleDispatch);
});

function loadSelectOptions() {
    const allocations = JSON.parse(localStorage.getItem('drras_allocations') || '[]');

    const allocSelect = document.getElementById('allocationId');
    allocSelect.innerHTML = '<option value="">Select Allocation to Dispatch...</option>';

    // Only those pending dispatch
    allocations.filter(a => a.status === 'Pending Dispatch').forEach(al => {
        const option = document.createElement('option');
        option.value = al.id;
        option.textContent = `${al.id} - Req ${al.reqId} (Qty: ${al.quantity})`;
        allocSelect.appendChild(option);
    });
}

function loadDispatchesTable() {
    const dispatches = JSON.parse(localStorage.getItem('drras_dispatches') || '[]');
    const tbody = document.getElementById('dispatchesList');

    // Sort by date newest first
    dispatches.sort((a, b) => new Date(b.dispatchDate) - new Date(a.dispatchDate));

    tbody.innerHTML = '';

    if (dispatches.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center">No active dispatches.</td></tr>`;
        return;
    }

    dispatches.forEach(d => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${d.id}</strong></td>
            <td>${d.allocationId}</td>
            <td>${d.dispatchDate}</td>
            <td>${d.expectedDelivery}</td>
            <td>${getStatusBadge(d.status)}</td>
        `;
        tbody.appendChild(tr);
    });
}

function handleDispatch(e) {
    e.preventDefault();

    const allocationId = document.getElementById('allocationId').value;
    const dispatchDate = document.getElementById('dispatchDate').value;
    const expectedDelivery = document.getElementById('expectedDelivery').value;

    // Find the allocation to copy the reqId over for tracking
    const allocations = JSON.parse(localStorage.getItem('drras_allocations') || '[]');
    const allocation = allocations.find(a => a.id === allocationId);

    const newDispatch = {
        id: generateId('DSP'),
        allocationId,
        reqId: allocation ? allocation.reqId : '',
        dispatchDate,
        expectedDelivery,
        status: 'In Transit'
    };

    const dispatches = JSON.parse(localStorage.getItem('drras_dispatches') || '[]');
    dispatches.push(newDispatch);
    localStorage.setItem('drras_dispatches', JSON.stringify(dispatches));

    // Update allocation status
    const allocIndex = allocations.findIndex(a => a.id === allocationId);
    if (allocIndex !== -1) {
        allocations[allocIndex].status = 'Dispatched';
        localStorage.setItem('drras_allocations', JSON.stringify(allocations));
    }

    // Reset form and reload tables
    document.getElementById('dispatchForm').reset();
    document.getElementById('dispatchDate').value = getTodayDateString();

    loadSelectOptions();
    loadDispatchesTable();

    alert(`Resource Dispatch ${newDispatch.id} successfully initiated.`);
}
