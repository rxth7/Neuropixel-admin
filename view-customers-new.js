import {
    auth,
    db,
    requireAuth,
    setupLogout
} from './auth-check.js';
import {
    collection,
    getDocs,
    doc,
    updateDoc,
    deleteDoc,
    query,
    orderBy,
    Timestamp,
    arrayUnion
} from 'https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js';
import {
    showAlert,
    showConfirm,
    showToast,
    setButtonLoading
} from './ui-utils.js';

let allCustomers = [];
let filteredCustomers = [];

// Require authentication
await requireAuth();
setupLogout();

// Load Customers
async function loadCustomers() {
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

        filteredCustomers = [...allCustomers];
        displayCustomers();
        populateFilters();
    } catch (error) {
        console.error('Error loading customers:', error);
        showToast('Error loading customers', 'error');
    }
}

// Display Customers
function displayCustomers() {
    const tbody = document.getElementById('customersTableBody');
    tbody.innerHTML = '';

    if (filteredCustomers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="10" style="text-align: center; padding: 40px;">No customers found</td></tr>';
        return;
    }

    filteredCustomers.forEach(customer => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${customer.shopName}</td>
            <td>${customer.ownerName}</td>
            <td>${customer.phoneNumber}</td>
            <td>${customer.shopType}</td>
            <td>${customer.serviceChosen}</td>
            <td>${customer.location}</td>
            <td>₹${customer.budget.toLocaleString('en-IN')}</td>
            <td><span class="status-badge status-${customer.orderStatus}">${customer.orderStatus.toUpperCase()}</span></td>
            <td>₹${customer.advanceReceived.toLocaleString('en-IN')} / ₹${customer.budget.toLocaleString('en-IN')}</td>
            <td>
                <button class="action-btn btn-edit" onclick="window.editCustomer('${customer.id}')">Edit</button>
                <button class="action-btn btn-invoice" onclick="window.generateInvoice('${customer.id}')">Invoice</button>
                <button class="action-btn" style="background: #fef3c7; color: #92400e;" onclick="window.addPayment('${customer.id}')">Payment</button>
                <button class="action-btn btn-delete" onclick="window.deleteCustomer('${customer.id}')">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

function getPaymentStatus(customer) {
    if (customer.advanceReceived >= customer.budget) return 'paid';
    if (customer.advanceReceived > 0) return 'partial';
    return 'pending';
}

// Populate Filters
function populateFilters() {
    const shopTypes = [...new Set(allCustomers.map(c => c.shopType))];
    const locations = [...new Set(allCustomers.map(c => c.location))];

    const shopTypeFilter = document.getElementById('filterShopType');
    const locationFilter = document.getElementById('filterLocation');

    shopTypeFilter.innerHTML = '<option value="">All Shop Types</option>';
    locationFilter.innerHTML = '<option value="">All Locations</option>';

    shopTypes.forEach(type => {
        shopTypeFilter.innerHTML += `<option value="${type}">${type}</option>`;
    });

    locations.forEach(loc => {
        locationFilter.innerHTML += `<option value="${loc}">${loc}</option>`;
    });
}

// Search and Filter
document.getElementById('searchInput').addEventListener('input', applyFilters);
document.getElementById('filterShopType').addEventListener('change', applyFilters);
document.getElementById('filterLocation').addEventListener('change', applyFilters);
document.getElementById('filterPaymentStatus').addEventListener('change', applyFilters);
document.getElementById('filterOrderStatus').addEventListener('change', applyFilters);

function applyFilters() {
    const search = document.getElementById('searchInput').value.toLowerCase();
    const shopType = document.getElementById('filterShopType').value;
    const location = document.getElementById('filterLocation').value;
    const paymentStatus = document.getElementById('filterPaymentStatus').value;
    const orderStatus = document.getElementById('filterOrderStatus').value;

    filteredCustomers = allCustomers.filter(customer => {
        const matchSearch = !search ||
            customer.shopName.toLowerCase().includes(search) ||
            customer.ownerName.toLowerCase().includes(search) ||
            customer.phoneNumber.includes(search);

        const matchShopType = !shopType || customer.shopType === shopType;
        const matchLocation = !location || customer.location === location;
        const matchOrderStatus = !orderStatus || customer.orderStatus === orderStatus;

        let matchPaymentStatus = true;
        if (paymentStatus) {
            const status = getPaymentStatus(customer);
            matchPaymentStatus = status === paymentStatus;
        }

        return matchSearch && matchShopType && matchLocation && matchPaymentStatus && matchOrderStatus;
    });

    displayCustomers();
}

// Edit Customer
window.editCustomer = function(id) {
    const customer = allCustomers.find(c => c.id === id);
    if (!customer) return;

    document.getElementById('editId').value = id;
    document.getElementById('editShopName').value = customer.shopName;
    document.getElementById('editOwnerName').value = customer.ownerName;
    document.getElementById('editPhoneNumber').value = customer.phoneNumber;
    document.getElementById('editExtraPhone').value = customer.extraPhone || '';
    document.getElementById('editShopType').value = customer.shopType;
    document.getElementById('editServiceChosen').value = customer.serviceChosen;
    document.getElementById('editLocation').value = customer.location;
    document.getElementById('editAddress').value = customer.address || '';
    document.getElementById('editBudget').value = customer.budget;
    document.getElementById('editOrderStatus').value = customer.orderStatus;
    document.getElementById('editDeliveryDate').value = customer.deliveryDate || '';
    document.getElementById('editNextPaymentDate').value = customer.nextPaymentDate || '';

    document.getElementById('editModal').style.display = 'block';
}

document.querySelector('.close').addEventListener('click', () => {
    document.getElementById('editModal').style.display = 'none';
});

document.getElementById('editForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('editId').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');

    setButtonLoading(submitBtn, true);

    const updatedData = {
        shopName: document.getElementById('editShopName').value,
        ownerName: document.getElementById('editOwnerName').value,
        phoneNumber: document.getElementById('editPhoneNumber').value,
        extraPhone: document.getElementById('editExtraPhone').value,
        shopType: document.getElementById('editShopType').value,
        serviceChosen: document.getElementById('editServiceChosen').value,
        location: document.getElementById('editLocation').value,
        address: document.getElementById('editAddress').value,
        budget: parseFloat(document.getElementById('editBudget').value),
        orderStatus: document.getElementById('editOrderStatus').value,
        deliveryDate: document.getElementById('editDeliveryDate').value,
        nextPaymentDate: document.getElementById('editNextPaymentDate').value
    };

    try {
        await updateDoc(doc(db, 'customers', id), updatedData);
        setButtonLoading(submitBtn, false);
        document.getElementById('editModal').style.display = 'none';
        await showAlert('Customer updated successfully!', 'success');
        loadCustomers();
    } catch (error) {
        setButtonLoading(submitBtn, false);
        await showAlert('Error updating customer: ' + error.message, 'error');
    }
});

// Add Payment
window.addPayment = function(id) {
    const customer = allCustomers.find(c => c.id === id);
    if (!customer) return;

    document.getElementById('paymentCustomerId').value = id;
    document.getElementById('paymentDate').valueAsDate = new Date();
    document.getElementById('paymentModal').style.display = 'block';
}

document.querySelector('.close-payment').addEventListener('click', () => {
    document.getElementById('paymentModal').style.display = 'none';
});

document.getElementById('paymentForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('paymentCustomerId').value;
    const submitBtn = e.target.querySelector('button[type="submit"]');

    setButtonLoading(submitBtn, true);

    const amount = parseFloat(document.getElementById('paymentAmount').value);
    const paymentType = document.getElementById('paymentType').value;
    const paymentDate = document.getElementById('paymentDate').value;
    const notes = document.getElementById('paymentNotes').value;

    const customer = allCustomers.find(c => c.id === id);
    const newAdvance = (customer.advanceReceived || 0) + amount;

    const payment = {
        amount: amount,
        type: paymentType,
        date: Timestamp.fromDate(new Date(paymentDate)),
        notes: notes,
        addedAt: Timestamp.now()
    };

    try {
        await updateDoc(doc(db, 'customers', id), {
            advanceReceived: newAdvance,
            paymentHistory: arrayUnion(payment)
        });

        setButtonLoading(submitBtn, false);
        document.getElementById('paymentModal').style.display = 'none';
        await showAlert('Payment added successfully!', 'success');
        e.target.reset();
        loadCustomers();
    } catch (error) {
        setButtonLoading(submitBtn, false);
        await showAlert('Error adding payment: ' + error.message, 'error');
    }
});

// Delete Customer
window.deleteCustomer = async function(id) {
    const confirmed = await showConfirm(
        'This action cannot be undone. All customer data will be permanently deleted.',
        'Delete Customer?'
    );

    if (!confirmed) return;

    try {
        await deleteDoc(doc(db, 'customers', id));
        showToast('Customer deleted successfully', 'success');
        loadCustomers();
    } catch (error) {
        await showAlert('Error deleting customer: ' + error.message, 'error');
    }
}

// Export
document.getElementById('exportBtn').addEventListener('click', () => {
    exportToCSV(filteredCustomers);
    showToast('Data exported successfully', 'success');
});

function exportToCSV(data) {
    const headers = ['Shop Name', 'Owner Name', 'Phone', 'Extra Phone', 'Shop Type', 'Service', 'Location', 'Address', 'Budget', 'Advance', 'Order Status', 'Delivery Date', 'Next Payment'];
    const rows = data.map(c => [
        c.shopName, c.ownerName, c.phoneNumber, c.extraPhone || '', c.shopType, c.serviceChosen,
        c.location, c.address || '', c.budget, c.advanceReceived, c.orderStatus,
        c.deliveryDate || '', c.nextPaymentDate || ''
    ]);

    let csv = headers.join(',') + '\n';
    rows.forEach(row => {
        csv += row.map(field => `"${field}"`).join(',') + '\n';
    });

    const blob = new Blob([csv], {
        type: 'text/csv'
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `neuropixel-customers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
}

// Generate Invoice (keeping existing function)
window.generateInvoice = function(id) {
    const customer = allCustomers.find(c => c.id === id);
    if (!customer) return;

    const invoiceWindow = window.open('', '_blank');
    const invoiceHTML = generateInvoiceHTML(customer);
    invoiceWindow.document.write(invoiceHTML);
    invoiceWindow.document.close();

    setTimeout(() => {
        invoiceWindow.print();
    }, 500);
}

function generateInvoiceHTML(customer) {
    const invoiceDate = new Date().toLocaleDateString('en-IN');
    const balance = customer.budget - customer.advanceReceived;

    return `
<!DOCTYPE html>
<html>
<head>
    <title>Invoice - ${customer.shopName}</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: Arial, sans-serif; padding: 40px; }
        .invoice-container { max-width: 800px; margin: 0 auto; border: 2px solid #333; padding: 30px; }
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
        .logo { width: 120px; }
        .company-info { text-align: right; }
        .company-info h1 { color: #2563eb; font-size: 28px; }
        .company-info p { margin: 5px 0; color: #666; }
        .invoice-details { display: flex; justify-content: space-between; margin-bottom: 30px; }
        .section { flex: 1; }
        .section h3 { color: #2563eb; margin-bottom: 10px; font-size: 16px; }
        .section p { margin: 5px 0; color: #333; }
        table { width: 100%; border-collapse: collapse; margin: 30px 0; }
        th, td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        th { background: #f8f9fa; font-weight: 600; }
        .total-section { text-align: right; margin-top: 20px; }
        .total-row { display: flex; justify-content: flex-end; margin: 10px 0; font-size: 16px; }
        .total-row span:first-child { margin-right: 20px; font-weight: 600; }
        .grand-total { font-size: 20px; color: #2563eb; font-weight: bold; border-top: 2px solid #333; padding-top: 10px; margin-top: 10px; }
        .footer { margin-top: 40px; text-align: center; color: #666; font-size: 14px; border-top: 1px solid #ddd; padding-top: 20px; }
        @media print { body { padding: 0; } .invoice-container { border: none; } }
    </style>
</head>
<body>
    <div class="invoice-container">
        <div class="header">
            <img src="img-invoice.png" alt="NeuroPixel" class="logo" onerror="this.style.display='none'">
            <div class="company-info">
                <h1>NeuroPixel</h1>
                <p>Professional Website Design & Branding</p>
                <p>www.neuropixel.co4.in</p>
                <p>Phone: 6366481847 / 6360863414</p>
                <p>Email: neuropxlstudio@gmail.com</p>
            </div>
        </div>
        
        <div class="invoice-details">
            <div class="section">
                <h3>BILL TO:</h3>
                <p><strong>${customer.shopName}</strong></p>
                <p>${customer.ownerName}</p>
                <p>${customer.phoneNumber}</p>
                ${customer.extraPhone ? `<p>${customer.extraPhone}</p>` : ''}
                <p>${customer.location}</p>
                ${customer.address ? `<p>${customer.address}</p>` : ''}
            </div>
            <div class="section">
                <h3>INVOICE DETAILS:</h3>
                <p><strong>Invoice Date:</strong> ${invoiceDate}</p>
                <p><strong>Invoice #:</strong> ${customer.invoiceNumber || 'NP-' + Date.now().toString().slice(-8)}</p>
                <p><strong>Status:</strong> ${customer.orderStatus.toUpperCase()}</p>
                ${customer.deliveryDate ? `<p><strong>Delivery Date:</strong> ${new Date(customer.deliveryDate).toLocaleDateString('en-IN')}</p>` : ''}
            </div>
        </div>
        
        <table>
            <thead>
                <tr>
                    <th>Service Description</th>
                    <th>Shop Type</th>
                    <th style="text-align: right;">Amount</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>${customer.serviceChosen}</td>
                    <td>${customer.shopType}</td>
                    <td style="text-align: right;">₹${customer.budget.toLocaleString('en-IN')}</td>
                </tr>
            </tbody>
        </table>
        
        <div class="total-section">
            <div class="total-row">
                <span>Subtotal:</span>
                <span>₹${customer.budget.toLocaleString('en-IN')}</span>
            </div>
            <div class="total-row">
                <span>Advance Paid:</span>
                <span>₹${customer.advanceReceived.toLocaleString('en-IN')}</span>
            </div>
            <div class="total-row grand-total">
                <span>Balance Due:</span>
                <span>₹${balance.toLocaleString('en-IN')}</span>
            </div>
            ${customer.nextPaymentDate ? `<p style="margin-top: 15px;"><strong>Next Payment Due:</strong> ${new Date(customer.nextPaymentDate).toLocaleDateString('en-IN')}</p>` : ''}
        </div>
        
        <div class="footer">
            <p><strong>Thank you for choosing NeuroPixel!</strong></p>
            <p>We design professional websites for shops and brands at competitive prices.</p>
            <p>For queries, contact us at www.neuropixel.co4.in</p>
            <p style="margin-top: 20px; font-size: 12px; font-style: italic; color: #999;">
                This is a computer-generated invoice and does not require a signature.
            </p>
        </div>
    </div>
</body>
</html>
    `;
}

// Load customers on page load
loadCustomers();