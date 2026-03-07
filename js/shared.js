// shared.js - common UI logic

document.addEventListener('DOMContentLoaded', () => {
    // Mobile menu toggle
    const menuToggle = document.getElementById('menuToggle');
    const navLinks = document.getElementById('navLinks');

    if (menuToggle && navLinks) {
        menuToggle.addEventListener('click', () => {
            navLinks.classList.toggle('show');
        });
    }

    // Initialize mock data in localStorage if not exists
    initMockData();
});

// Mock data initialization for completely functional frontend demo
function initMockData() {
    if (!localStorage.getItem('drras_initialized')) {
        const mockDisasters = [
            { id: 'D-101', type: 'Flood', severity: 'High', date: '2026-03-01' },
            { id: 'D-102', type: 'Earthquake', severity: 'Critical', date: '2026-03-05' }
        ];

        const mockAreas = [
            { id: 'A-001', disasterId: 'D-101', name: 'Riverdale', population: 5200, severityScore: 8, lastAssistance: '2026-03-03' },
            { id: 'A-002', disasterId: 'D-101', name: 'Lower Basin', population: 3100, severityScore: 6, lastAssistance: '2026-03-04' },
            { id: 'A-003', disasterId: 'D-102', name: 'Westend Hills', population: 12500, severityScore: 9, lastAssistance: 'None' }
        ];

        const mockResources = [
            { id: 'R-WTR', name: 'Drinking Water (Liters)' },
            { id: 'R-FDK', name: 'Food Kits (Units)' },
            { id: 'R-MED', name: 'Medical Supplies (Kits)' },
            { id: 'R-TNT', name: 'Tents (Units)' }
        ];

        const mockInventory = [
            { centerId: 'C-North', resourceId: 'R-WTR', resourceName: 'Drinking Water (Liters)', available: 50000, buffer: 10000 },
            { centerId: 'C-North', resourceId: 'R-FDK', resourceName: 'Food Kits (Units)', available: 5000, buffer: 1000 },
            { centerId: 'C-South', resourceId: 'R-MED', resourceName: 'Medical Supplies (Kits)', available: 1200, buffer: 300 },
            { centerId: 'C-East', resourceId: 'R-TNT', resourceName: 'Tents (Units)', available: 800, buffer: 200 }
        ];

        const mockRequests = [
            { id: 'REQ-1001', areaId: 'A-001', resourceId: 'R-WTR', resourceName: 'Drinking Water (Liters)', quantity: 10000, date: '2026-03-02', status: 'Delivered' },
            { id: 'REQ-1002', areaId: 'A-003', resourceId: 'R-MED', resourceName: 'Medical Supplies (Kits)', quantity: 500, date: '2026-03-06', status: 'Pending' },
            { id: 'REQ-1003', areaId: 'A-003', resourceId: 'R-TNT', resourceName: 'Tents (Units)', quantity: 200, date: '2026-03-06', status: 'Allocated' }
        ];

        const mockAllocations = [
            { id: 'ALC-5001', reqId: 'REQ-1001', centerId: 'C-North', quantity: 10000, date: '2026-03-02', status: 'Dispatched' },
            { id: 'ALC-5002', reqId: 'REQ-1003', centerId: 'C-East', quantity: 200, date: '2026-03-07', status: 'Pending Dispatch' }
        ];

        const mockDispatches = [
            { id: 'DSP-8001', allocationId: 'ALC-5001', reqId: 'REQ-1001', dispatchDate: '2026-03-03', expectedDelivery: '2026-03-03', status: 'Delivered' }
        ];

        const mockDeliveries = [
            { id: 'DEL-9001', dispatchId: 'DSP-8001', receivedQuantity: 10000, deliveryDate: '2026-03-03', notes: 'Arrived safely' }
        ];

        localStorage.setItem('drras_disasters', JSON.stringify(mockDisasters));
        localStorage.setItem('drras_areas', JSON.stringify(mockAreas));
        localStorage.setItem('drras_resources', JSON.stringify(mockResources));
        localStorage.setItem('drras_inventory', JSON.stringify(mockInventory));
        localStorage.setItem('drras_requests', JSON.stringify(mockRequests));
        localStorage.setItem('drras_allocations', JSON.stringify(mockAllocations));
        localStorage.setItem('drras_dispatches', JSON.stringify(mockDispatches));
        localStorage.setItem('drras_deliveries', JSON.stringify(mockDeliveries));
        localStorage.setItem('drras_initialized', 'true');
    }
}

// Utility to generate unique ID
function generateId(prefix) {
    return prefix + '-' + Math.floor(Math.random() * 9000 + 1000);
}

// Utility to get today's date in YYYY-MM-DD format
function getTodayDateString() {
    return new Date().toISOString().split('T')[0];
}

// Helper to render status badges
function getStatusBadge(status) {
    const s = status.toLowerCase();
    let badgeClass = 'badge-pending';
    
    if (s.includes('allocat')) badgeClass = 'badge-allocated';
    else if (s.includes('dispatch')) badgeClass = 'badge-dispatched';
    else if (s.includes('deliver')) badgeClass = 'badge-delivered';
    else if (s.includes('critical') || s.includes('high')) badgeClass = 'badge-danger';
    
    return `<span class="badge ${badgeClass}">${status}</span>`;
}
