// delivery-report.js

document.addEventListener('DOMContentLoaded', () => {
    loadDeliveries();
});

function loadDeliveries() {
    const deliveries = JSON.parse(localStorage.getItem('drras_deliveries') || '[]');
    const tbody = document.getElementById('deliveriesList');

    // Sort by date newest first
    deliveries.sort((a, b) => new Date(b.deliveryDate) - new Date(a.deliveryDate));

    tbody.innerHTML = '';

    if (deliveries.length === 0) {
        tbody.innerHTML = `<tr><td colspan="5" style="text-align:center">No deliveries recorded.</td></tr>`;
        return;
    }

    deliveries.forEach(del => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${del.id}</strong></td>
            <td>${del.dispatchId}</td>
            <td>${del.receivedQuantity.toLocaleString()}</td>
            <td>${del.deliveryDate}</td>
            <td>${del.notes || '-'}</td>
        `;
        tbody.appendChild(tr);
    });
}
