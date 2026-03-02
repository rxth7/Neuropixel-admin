import {
    auth,
    db,
    requireAuth,
    setupLogout
} from './auth-check.js';
import {
    collection,
    addDoc,
    getDocs,
    Timestamp
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import {
    showAlert,
    showToast,
    setButtonLoading
} from './ui-utils.js';

// Require authentication
await requireAuth();
setupLogout();

// Generate unique invoice number
function generateInvoiceNumber() {
    const timestamp = Date.now().toString().slice(-8);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `NP-${timestamp}-${random}`;
}

// Load suggestions from existing customers
async function loadSuggestions() {
    try {
        const querySnapshot = await getDocs(collection(db, 'customers'));
        const shopTypes = new Set();
        const locations = new Set();
        const services = new Set();

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            if (data.shopType) shopTypes.add(data.shopType);
            if (data.location) locations.add(data.location);
            if (data.serviceChosen) services.add(data.serviceChosen);
        });

        // Populate datalists
        updateDatalist('shopTypeList', Array.from(shopTypes));
        updateDatalist('locationList', Array.from(locations));
        updateDatalist('serviceList', Array.from(services));
    } catch (error) {
        console.error('Error loading suggestions:', error);
    }
}

function updateDatalist(id, items) {
    const datalist = document.getElementById(id);
    datalist.innerHTML = '';
    items.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        datalist.appendChild(option);
    });
}

// Add Customer Form
document.getElementById('customerForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = e.target.querySelector('button[type="submit"]');
    setButtonLoading(submitBtn, true);

    const advanceAmount = parseFloat(document.getElementById('advanceReceived').value) || 0;

    // Generate unique invoice number
    const invoiceNumber = generateInvoiceNumber();

    const customerData = {
        shopName: document.getElementById('shopName').value.trim(),
        ownerName: document.getElementById('ownerName').value.trim(),
        phoneNumber: document.getElementById('phoneNumber').value.trim(),
        extraPhone: document.getElementById('extraPhone').value.trim() || '',
        shopType: document.getElementById('shopType').value.trim(),
        serviceChosen: document.getElementById('serviceChosen').value.trim(),
        location: document.getElementById('location').value.trim(),
        address: document.getElementById('address').value.trim() || '',
        budget: parseFloat(document.getElementById('budget').value),
        orderStatus: document.getElementById('orderStatus').value,
        deliveryDate: document.getElementById('deliveryDate').value || '',
        advanceReceived: advanceAmount,
        nextPaymentDate: document.getElementById('nextPaymentDate').value || '',
        invoiceNumber: invoiceNumber, // Store unique invoice number
        createdAt: Timestamp.now(),
        paymentHistory: advanceAmount > 0 ? [{
            amount: advanceAmount,
            date: Timestamp.now(),
            type: 'advance',
            notes: 'Initial advance payment',
            addedAt: Timestamp.now()
        }] : []
    };

    try {
        await addDoc(collection(db, 'customers'), customerData);
        setButtonLoading(submitBtn, false);
        await showAlert(
            `Customer added successfully!<br><br>Invoice Number: <strong style="color: #2563eb; font-size: 18px;">${invoiceNumber}</strong>`,
            'success'
        );
        e.target.reset();

        // Reload suggestions to include new data
        loadSuggestions();
    } catch (error) {
        console.error('Error adding customer:', error);
        setButtonLoading(submitBtn, false);
        await showAlert('Error adding customer: ' + error.message, 'error');
    }
});

// Load suggestions on page load
loadSuggestions();