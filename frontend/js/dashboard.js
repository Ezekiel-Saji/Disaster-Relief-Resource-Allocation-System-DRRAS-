// dashboard.js

document.addEventListener('DOMContentLoaded', () => {
    loadDashboardStats();
    loadRecentActivity();
});

function loadDashboardStats() {
    const disasters = JSON.parse(localStorage.getItem('drras_disasters') || '[]');
    const areas = JSON.parse(localStorage.getItem('drras_areas') || '[]');
    const requests = JSON.parse(localStorage.getItem('drras_requests') || '[]');
    const inventory = JSON.parse(localStorage.getItem('drras_inventory') || '[]');

    const pendingRequests = requests.filter(r => r.status === 'Pending').length;

    const totalResources = inventory.reduce((sum, item) => sum + parseInt(item.available), 0);

    // Format numbers nicely
    const formatNumber = (num) => num > 1000 ? (num / 1000).toFixed(1) + 'k' : num;

    document.getElementById('totalDisasters').textContent = disasters.length;
    document.getElementById('affectedAreas').textContent = areas.length;
    document.getElementById('pendingRequests').textContent = pendingRequests;
    document.getElementById('availableResources').textContent = formatNumber(totalResources);
}

function loadRecentActivity() {
    const requests = JSON.parse(localStorage.getItem('drras_requests') || '[]');
    const allocations = JSON.parse(localStorage.getItem('drras_allocations') || '[]');
    const dispatches = JSON.parse(localStorage.getItem('drras_dispatches') || '[]');

    // Create a combined activity stream
    let activities = [];

    requests.forEach(r => {
        activities.push({
            time: r.date,
            action: `New Request: ${r.resourceName} (${r.quantity})`,
            target: `Area ${r.areaId}`,
            status: r.status,
            rawDate: new Date(r.date)
        });
    });

    allocations.forEach(a => {
        activities.push({
            time: a.date,
            action: `Allocated requested resources`,
            target: `Request ${a.reqId} from ${a.centerId}`,
            status: a.status,
            rawDate: new Date(a.date)
        });
    });

    dispatches.forEach(d => {
        activities.push({
            time: d.dispatchDate,
            action: `Dispatched resources`,
            target: `Allocation ${d.allocationId}`,
            status: d.status,
            rawDate: new Date(d.dispatchDate)
        });
    });

    // Sort by date descending
    activities.sort((a, b) => b.rawDate - a.rawDate);

    // Take top 5
    const recentActivity = activities.slice(0, 5);

    const tbody = document.getElementById('recentActivityList');
    tbody.innerHTML = '';

    if (recentActivity.length === 0) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center">No recent activity found.</td></tr>`;
        return;
    }

    recentActivity.forEach(activity => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${activity.time}</td>
            <td><strong>${activity.action}</strong></td>
            <td>${activity.target}</td>
            <td>${getStatusBadge(activity.status)}</td>
        `;
        tbody.appendChild(tr);
    });
}
