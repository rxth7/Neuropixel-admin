# NeuroPixel Admin Dashboard

Professional admin dashboard for managing customer orders, shop details, and generating invoices.

## Features

- **Secure Authentication**: Firebase Authentication for admin login
- **Customer Management**: Add, edit, delete customer records
- **Smart Suggestions**: Auto-suggestions for location, shop type, and services
- **Advanced Filtering**: Filter by shop type, location, payment status, and order status
- **Search Functionality**: Quick search across all customer fields
- **Invoice Generation**: Professional PDF invoices with company branding
- **Export Data**: Export filtered data to CSV format
- **Payment Tracking**: Track advances and payment history with timestamps
- **Responsive Design**: Modern, professional UI with sidebar navigation

## Setup Instructions

### 1. Firebase Configuration

Your Firebase project is already configured in the code. Make sure:
- Firebase Authentication is enabled (Email/Password provider)
- Firestore Database is set up in production mode
- Security rules are configured properly

### 2. Required Files

Place these files in your project root:
- `logo.png` - Your NeuroPixel logo (for sidebar and login)
- `img-invoice.png` - Logo for invoices
- `favicon.ico` - Website favicon

### 3. Initial Setup

1. Open `setup-admin.html` in your browser
2. Create your admin account with email and password
3. You'll be redirected to the login page

### 4. Login

1. Open `index.html` in your browser
2. Login with the credentials you created
3. Start managing customers!

## Usage Guide

### Adding Customers

1. Click "Add Customer" in the sidebar
2. Fill in all required fields (marked with *)
3. Optional fields: Extra phone, address
4. Click "Add Customer" to save

### Viewing Customers

1. Click "View Customers" in the sidebar
2. Use filters to narrow down results:
   - Search by name, phone, or shop name
   - Filter by shop type, location, payment status, order status
3. Export filtered data using the "Export" button

### Editing Customers

1. Click the "Edit" button on any customer row
2. Update the information in the modal
3. Click "Update Customer" to save changes

### Generating Invoices

1. Click the "Invoice" button on any customer row
2. A professional invoice will open in a new window
3. Print or save as PDF using your browser's print function

### Deleting Customers

1. Click the "Delete" button on any customer row
2. Confirm the deletion
3. The record will be permanently removed

## Database Structure

### Customers Collection

```javascript
{
  shopName: string,
  ownerName: string,
  phoneNumber: string,
  extraPhone: string,
  shopType: string,
  serviceChosen: string,
  location: string,
  address: string,
  budget: number,
  advanceReceived: number,
  orderStatus: 'pending' | 'confirmed' | 'rejected',
  deliveryDate: string,
  nextPaymentDate: string,
  createdAt: Timestamp,
  paymentHistory: [{
    amount: number,
    date: Timestamp,
    type: string
  }]
}
```

## Security Notes

- Never share your Firebase configuration publicly
- Use strong passwords for admin accounts
- Configure Firestore security rules to restrict access
- Keep your admin credentials secure

## Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## Support

For issues or questions, visit: www.neuropixel.co4.in

---

**NeuroPixel** - Professional Website Design & Branding at Competitive Prices
