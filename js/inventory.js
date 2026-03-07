// inventory.js

document.addEventListener('DOMContentLoaded', () => {
    loadInventory();
});

function loadInventory() {
    const inventory = JSON.parse(localStorage.getItem('drras_inventory') || '[]');
    const tbody = document.getElementById('inventoryList');

    // Sort by Center ID
    inventory.sort((a, b) => a.centerId.localeCompare(b.centerId));

    tbody.innerHTML = '';

    if (inventory.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" style="text-align:center">No inventory records found.</td></tr>`;
        return;
    }

    inventory.forEach(item => {
        const isLow = item.available <= item.buffer * 1.5;
        const statusBadge = isLow ? '<span class="badge badge-danger">Low Stock</span>' : '<span class="badge badge-delivered">Adequate</span>';

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${item.centerId}</strong></td>
            <td>${item.resourceId}</td>
            <td>${item.resourceName}</td>
            <td style="${isLow ? 'color: var(--alert-danger); font-weight: bold;' : ''}">${item.available.toLocaleString()}</td>
            <td>${item.buffer.toLocaleString()}</td>
            <td>${statusBadge}</td>
        `;
        tbody.appendChild(tr);
    });
}
