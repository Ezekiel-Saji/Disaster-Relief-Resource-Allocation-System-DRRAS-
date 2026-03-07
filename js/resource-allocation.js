// resource-allocation.js

document.addEventListener('DOMContentLoaded', () => {
    // Set default date
    document.getElementById('allocationDate').value = getTodayDateString();

    loadSelectOptions();
    loadAllocationsTable();

    document.getElementById('allocationForm').addEventListener('submit', handleAllocation);
    document.getElementById('reqId').addEventListener('change', populateQuantity);
});

function loadSelectOptions() {
    const requests = JSON.parse(localStorage.getItem('drras_requests') || '[]');
    const inventory = JSON.parse(localStorage.getItem('drras_inventory') || '[]');

    const reqSelect = document.getElementById('reqId');
    reqSelect.innerHTML = '<option value="">Select a Request...</option>';

    // Only pending or partially allocated
    requests.filter(r => r.status === 'Pending').forEach(req => {
        const option = document.createElement('option');
        option.value = req.id;
        option.textContent = `${req.id} - ${req.resourceName} (${req.quantity} needed)`;
        option.dataset.qty = req.quantity;
        reqSelect.appendChild(option);
    });

    // Unique centers from inventory
    const centers = [...new Set(inventory.map(i => i.centerId))];
    const centerSelect = document.getElementById('centerId');
    centerSelect.innerHTML = '<option value="">Select Source Center...</option>';

    centers.forEach(c => {
        const option = document.createElement('option');
        option.value = c;
        option.textContent = c;
        centerSelect.appendChild(option);
    });
}

function populateQuantity(e) {
    const selectedOption = e.target.options[e.target.selectedIndex];
    if (selectedOption && selectedOption.dataset.qty) {
        document.getElementById('allocatedQuantity').value = selectedOption.dataset.qty;
    }
}

function loadAllocationsTable() {
    const allocations = JSON.parse(localStorage.getItem('drras_allocations') || '[]');
    const tbody = document.getElementById('allocationsList');

    // Sort by date newest first
    allocations.sort((a, b) => new Date(b.date) - new Date(a.date));

    tbody.innerHTML = '';

    if (allocations.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center">No allocations recorded.</td></tr>`;
        return;
    }

    allocations.forEach(al => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${al.id}</strong></td>
            <td>${al.reqId}</td>
            <td>${al.centerId}</td>
            <td>${al.quantity.toLocaleString()}</td>
            <td>${al.date}</td>
            <td>${getStatusBadge(al.status)}</td>
        `;
        tbody.appendChild(tr);
    });
}

function handleAllocation(e) {
    e.preventDefault();

    const reqId = document.getElementById('reqId').value;
    const centerId = document.getElementById('centerId').value;
    const quantity = parseInt(document.getElementById('allocatedQuantity').value, 10);
    const date = document.getElementById('allocationDate').value;

    const newAllocation = {
        id: generateId('ALC'),
        reqId,
        centerId,
        quantity,
        date,
        status: 'Pending Dispatch'
    };

    const allocations = JSON.parse(localStorage.getItem('drras_allocations') || '[]');
    allocations.push(newAllocation);
    localStorage.setItem('drras_allocations', JSON.stringify(allocations));

    // Update request status
    const requests = JSON.parse(localStorage.getItem('drras_requests') || '[]');
    const reqIndex = requests.findIndex(r => r.id === reqId);
    if (reqIndex !== -1) {
        requests[reqIndex].status = 'Allocated';
        localStorage.setItem('drras_requests', JSON.stringify(requests));
    }

    // Reset form and reload tables
    document.getElementById('allocationForm').reset();
    document.getElementById('allocationDate').value = getTodayDateString();

    loadSelectOptions();
    loadAllocationsTable();

    alert(`Allocation ${newAllocation.id} created and linked to Request ${reqId}.`);
}
