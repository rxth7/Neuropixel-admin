import {
    auth,
    db,
    requireAuth,
    setupLogout
} from './auth-check.js';
import {
    collection,
    getDocs,
    query,
    orderBy
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';

let allCustomers = [];

// Require authentication
await requireAuth();
setupLogout();

// Load and display dashboard
async function loadDashboard() {
    try {
        const q = query(collection(db, 'customers'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        allCustomers = [];

        querySnapshot.forEach((doc) => {
            allCustomers.push({
                id: doc.id,
                ...doc.data()
            });
        });

        updateDashboard();
    } catch (error) {
        console.error('Error loading customers:', error);
    }
}

function updateDashboard() {
    const totalCustomers = allCustomers.length;
    const confirmedOrders = allCustomers.filter(c => c.orderStatus === 'confirmed').length;
    const pendingOrders = allCustomers.filter(c => c.orderStatus === 'pending').length;
    const totalRevenue = allCustomers.reduce((sum, c) => sum + (c.advanceReceived || 0), 0);

    document.getElementById('totalCustomers').textContent = totalCustomers;
    document.getElementById('confirmedOrders').textContent = confirmedOrders;
    document.getElementById('pendingOrders').textContent = pendingOrders;
    document.getElementById('totalRevenue').textContent = '₹' + totalRevenue.toLocaleString('en-IN');

    // Recent customers
    const recentCustomers = allCustomers.slice(0, 5);
    const tbody = document.getElementById('recentCustomersTable');
    tbody.innerHTML = '';

    if (recentCustomers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 40px;">No customers yet. Add your first customer!</td></tr>';
        return;
    }

    recentCustomers.forEach(customer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer.shopName}</td>
            <td>${customer.ownerName}</td>
            <td>${customer.phoneNumber}</td>
            <td>${customer.serviceChosen}</td>
            <td>₹${customer.budget.toLocaleString('en-IN')}</td>
            <td><span class="status-badge status-${customer.orderStatus}">${customer.orderStatus.toUpperCase()}</span></td>
        `;
        tbody.appendChild(row);
    });
}

// Load dashboard on page load
loadDashboard();