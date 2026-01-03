// Checkout functionality with WhatsApp & Razorpay - with Customer Details

// Get cart from localStorage
function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

// Get customer details using prompts
function getCustomerDetails() {
  const customerName = prompt('Enter your name:', '') || 'Guest Customer';
  const customerEmail = prompt('Enter your email:', '') || 'noemail@example.com';
  const customerPhone = prompt('Enter your phone number:', '') || '9000000000';
  const customerAddress = prompt('Enter your delivery address:', '') || 'Not provided';
  
  return {
    name: customerName,
    email: customerEmail,
    phone: customerPhone,
    address: customerAddress
  };
}

// WhatsApp Checkout - with customer details
const checkoutWhatsAppBtn = document.getElementById('checkoutWhatsApp');
if (checkoutWhatsAppBtn) {
  checkoutWhatsAppBtn.addEventListener('click', () => {
    const cart = getCart();
    
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    
    // Get customer details
    const customer = getCustomerDetails();
    
    const phoneNumber = '919714293282';
    let message = 'Hello StatusRing, I would like to order:%0A%0A';
    
    cart.forEach(item => {
      message += `* ${item.name} (Qty: ${item.quantity}) - ₹${item.price * item.quantity}%0A`;
    });
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `%0A*Total Amount: ₹${total}*%0A%0A*Customer Details:*%0AName: ${customer.name}%0AEmail: ${customer.email}%0APhone: ${customer.phone}%0AAddress: ${customer.address}`;
    
    // Store order details
    const order = {
      orderId: 'order_' + Date.now(),
      customer: customer,
      items: cart,
      total: total,
      paymentMethod: 'WhatsApp',
      timestamp: new Date().toLocaleString()
    };
    localStorage.setItem('lastOrder', JSON.stringify(order));
    
    // Log to console for record
    console.log('ORDER DETAILS:', order);
    
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappURL, '_blank');
  });
}

// Razorpay Checkout - with customer details
const checkoutRazorpayBtn = document.getElementById('checkoutRazorpay');
if (checkoutRazorpayBtn) {
  checkoutRazorpayBtn.addEventListener('click', () => {
    const cart = getCart();
    
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    
    // Get customer details BEFORE opening payment
    const customer = getCustomerDetails();
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const options = {
      key: 'rzp_live_RycGGdBVVqAFT9',
      amount: total * 100,
      currency: 'INR',
      name: 'StatusRing Store',
      description: 'Buy Premium Dental & Medical Education Posters',
      handler: function(response) {
        processPayment(response, cart, customer);
      },
      prefill: {
        name: customer.name,
        email: customer.email,
        contact: customer.phone
      },
      theme: {
        color: '#1abc9c'
      }
    };
    
    try {
      const rzp1 = new Razorpay(options);
      
      rzp1.on('payment.failed', function(response) {
        alert('Payment Failed: ' + response.error.description);
      });
      
      rzp1.open();
    } catch (error) {
      alert('Payment Error: ' + error.message);
      console.error('Razorpay Error:', error);
    }
  });
}

function processPayment(response, cart, customer) {
  const paymentDetails = {
    orderId: 'order_' + Date.now(),
    customer: customer,
    items: cart,
    total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
    paymentId: response.razorpay_payment_id,
    paymentMethod: 'Razorpay',
    timestamp: new Date().toLocaleString()
  };
  
  // Save order details to localStorage
  localStorage.setItem('lastOrder', JSON.stringify(paymentDetails));
  localStorage.setItem('orderHistory', JSON.stringify([
    ...(JSON.parse(localStorage.getItem('orderHistory')) || []),
    paymentDetails
  ]));
  
  // Log complete order details to console (visible in browser console - F12)
  console.log('\n===== COMPLETE ORDER DETAILS =====');
  console.log('Order ID:', paymentDetails.orderId);
  console.log('Customer Name:', paymentDetails.customer.name);
  console.log('Customer Email:', paymentDetails.customer.email);
  console.log('Customer Phone:', paymentDetails.customer.phone);
  console.log('Customer Address:', paymentDetails.customer.address);
  console.log('Items:', paymentDetails.items);
  console.log('Total Amount:', paymentDetails.total);
  console.log('Payment ID:', paymentDetails.paymentId);
  console.log('Timestamp:', paymentDetails.timestamp);
  console.log('Full Details:', paymentDetails);
  console.log('===================================\n');

   // Send email notification to owner and customer
  sendOrderEmail(paymentDetails);
  
  // Clear cart
  localStorage.setItem('cart', JSON.stringify([]));
  
  // Update UI
  if (window.updateCartUI) {
    window.updateCartUI();
  }
  
  // Close cart
  const cartSidebar = document.getElementById('cartSidebar');
  const cartOverlay = document.getElementById('cartOverlay');
  if (cartSidebar) cartSidebar.classList.remove('open');
  if (cartOverlay) cartOverlay.classList.remove('open');
  
  // Show success notification
  const notification = document.createElement('div');
  notification.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 30px; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); z-index: 3000; text-align: left; max-width: 500px; font-family: Arial, sans-serif;';
  notification.innerHTML = `
    <h2 style="color: #1abc9c; margin-bottom: 15px;">Payment Successful!</h2>
    <p style="margin-bottom: 10px; color: #666;">Thank you for your order.</p>
    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 15px; font-size: 13px;">
      <p style="margin: 5px 0;"><strong>Order ID:</strong> ${paymentDetails.orderId}</p>
      <p style="margin: 5px 0;"><strong>Name:</strong> ${paymentDetails.customer.name}</p>
      <p style="margin: 5px 0;"><strong>Email:</strong> ${paymentDetails.customer.email}</p>
      <p style="margin: 5px 0;"><strong>Phone:</strong> ${paymentDetails.customer.phone}</p>
      <p style="margin: 5px 0;"><strong>Total:</strong> ₹${paymentDetails.total}</p>
      <p style="margin: 5px 0;"><strong>Payment ID:</strong> ${response.razorpay_payment_id}</p>
    </div>
    <p style="margin-bottom: 15px; font-size: 12px; color: #999;">Check browser console (F12) for complete order details</p>
    <button onclick="this.parentElement.remove()" style="background: #1abc9c; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; width: 100%;">Close</button>
  `;
  document.body.appendChild(notification);
}


// Send email notification using Formspree (FREE service)
function sendOrderEmail(paymentDetails) {
  // Email configuration
  const ownerEmail = 'jioposters@gmail.com'; // CHANGE THIS TO YOUR EMAIL
  const formspreeId = 'mzozzbjn'; // We will set this up
  
  const emailData = {
    _subject: `New Order from ${paymentDetails.customer.name} - Order ID: ${paymentDetails.orderId}`,
    _replyto: paymentDetails.customer.email,
    orderid: paymentDetails.orderId,
    customername: paymentDetails.customer.name,
    customeremail: paymentDetails.customer.email,
    customerphone: paymentDetails.customer.phone,
    customeraddress: paymentDetails.customer.address,
    paymentid: paymentDetails.paymentId,
    amount: paymentDetails.total,
    items: JSON.stringify(paymentDetails.items, null, 2),
    timestamp: paymentDetails.timestamp,
    message: `New order received!\n\nCustomer: ${paymentDetails.customer.name}\nEmail: ${paymentDetails.customer.email}\nPhone: ${paymentDetails.customer.phone}\nAddress: ${paymentDetails.customer.address}\n\nOrder ID: ${paymentDetails.orderId}\nPayment ID: ${paymentDetails.paymentId}\nAmount: ₹${paymentDetails.total}\n\nItems:\n${JSON.stringify(paymentDetails.items, null, 2)}\n\nTimestamp: ${paymentDetails.timestamp}`
  };
  
  // Send email to yourself via Formspree
  fetch('https://formspree.io/f/mzozzbjn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(emailData)
  })
  .then(response => {
    if (response.ok) {
      console.log('Email notification sent to owner successfully!');
    } else {
      console.error('Failed to send email notification to owner');
    }
  })
  .catch(error => console.error('Error sending email:', error));
  
  // OPTIONAL: Send confirmation email to customer
  const customerEmailData = {
    _subject: 'Order Confirmation - StatusRing Store',
    _replyto: ownerEmail,
    customername: paymentDetails.customer.name,
    message: `Thank you for your order!\n\nOrder ID: ${paymentDetails.orderId}\nTotal Amount: ₹${paymentDetails.total}\n\nWe will process your order shortly and contact you at ${paymentDetails.customer.phone}.\n\nThank you for shopping with StatusRing!`
  };
  
  // Send confirmation to customer
  fetch('https://formspree.io/f/mzozzbjn', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ...customerEmailData, email: paymentDetails.customer.email })
  })
  .then(response => {
    if (response.ok) {
      console.log('Confirmation email sent to customer!');
    }
  })
  .catch(error => console.error('Error sending customer email:', error));
}


// Function to get all orders from localStorage
function getAllOrders() {
  return JSON.parse(localStorage.getItem('orderHistory')) || [];
}

// Function to clear all orders (use only when needed)
function clearAllOrders() {
  localStorage.removeItem('orderHistory');
  console.log('All orders cleared');
}

// Display all orders in console (for testing)
function showAllOrders() {
  const orders = getAllOrders();
  console.clear();
  console.log('========================================');
  console.log('ALL STATUSRING ORDERS');
  console.log('========================================');
  console.log(`Total Orders: ${orders.length}`);
  console.log('');
  
  if (orders.length === 0) {
    console.log('No orders yet.');
  } else {
    orders.forEach((order, index) => {
      console.log(`\n--- Order ${index + 1} ---`);
      console.log(`Order ID: ${order.orderId}`);
      console.log(`Customer: ${order.customer.name}`);
      console.log(`Email: ${order.customer.email}`);
      console.log(`Phone: ${order.customer.phone}`);
      console.log(`Address: ${order.customer.address}`);
      console.log(`Payment ID: ${order.paymentId}`);
      console.log(`Amount: ₹${order.total}`);
      console.log(`Items: ${JSON.stringify(order.items, null, 2)}`);
      console.log(`Timestamp: ${order.timestamp}`);
      console.log(`Status: PAID`);
    });
  }
  console.log('');
  console.log('========================================');
  console.log('Type showAllOrders() to refresh this view');
  console.log('========================================');
}

// Auto-show orders when page loads (for admin)
if (window.location.pathname.includes('admin') || window.location.hash === '#admin') {
  window.addEventListener('load', showAllOrders);
}


// ====== GOOGLE SHEETS INTEGRATION ======
// Submit orders to Google Sheet via Google Forms (bypasses API)
function submitOrderToGoogleSheet(paymentDetails) {
  // IMPORTANT: Replace with your Google Form URL
  // How to set up:
  // 1. Create a Google Form with these fields: OrderID, CustomerName, Email, Phone, Address, PaymentID, Items, Amount, Timestamp
  // 2. Copy the form ID from the URL
  // 3. View the form's source code to get field IDs
  // 4. Replace FORM_ID, FIELD_IDS below
  
  const FORM_URL = 'https://docs.google.com/forms/d/e/YOUR_FORM_ID_HERE/formResponse';
  
  // Field mappings (from Google Form - replace these with your actual field IDs)
  const fields = {
    'entry.123456789': paymentDetails.orderId,  // Order ID
    'entry.987654321': paymentDetails.customer.name,  // Customer Name
    'entry.111111111': paymentDetails.customer.email,  // Email
    'entry.222222222': paymentDetails.customer.phone,  // Phone
    'entry.333333333': paymentDetails.customer.address,  // Address
    'entry.444444444': paymentDetails.paymentId,  // Payment ID
    'entry.555555555': JSON.stringify(paymentDetails.items),  // Items
    'entry.666666666': paymentDetails.total,  // Amount
    'entry.777777777': paymentDetails.timestamp  // Timestamp
  };
  
  // Create FormData
  const formData = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    formData.append(key, value);
  }
  
  // Submit to Google Form
  fetch(FORM_URL, {
    method: 'POST',
    body: formData
  })
  .then(() => {
    console.log('✅ Order submitted to Google Sheet successfully!');
  })
  .catch(error => {
    console.error('❌ Error submitting to Google Sheet:', error);
  });
}

// Function to setup Google Sheets integration
function setupGoogleSheetsIntegration() {
  console.log('%c📊 Google Sheets Integration', 'color: green; font-size: 16px; font-weight: bold');
  console.log('%cSTEP 1: Create a Google Form', 'color: blue; font-weight: bold');
  console.log('- Go to https://forms.google.com');
  console.log('- Create a new form titled "StatusRing Orders"');
  console.log('\nSTEP 2: Add these fields to the form:');
  console.log('1. Order ID (Short answer)');
  console.log('2. Customer Name (Short answer)');
  console.log('3. Email (Short answer)');
  console.log('4. Phone (Short answer)');
  console.log('5. Address (Long answer)');
  console.log('6. Payment ID (Short answer)');
  console.log('7. Items (Short answer)');
  console.log('8. Amount (Short answer)');
  console.log('9. Timestamp (Short answer)');
  console.log('\nSTEP 3: Link form to Sheet');
  console.log('- In Form settings, click "Responses"');
  console.log('- Click green "Create Spreadsheet" button');
  console.log('- This creates a Google Sheet with your data');
  console.log('\nSTEP 4: Get Form ID & Field IDs');
  console.log('- Form ID: In URL - forms.google.com/...d/e/[FORM_ID]/viewform');
  console.log('- Field IDs: Right-click form > Inspect > Look for entry.XXXXXXXXX in form inputs');
  console.log('\nSTEP 5: Update checkout.js');
  console.log('- Replace FORM_URL and field entry IDs in submitOrderToGoogleSheet() function');
  console.log('\nSTEP 6: Enable email notifications in Google Apps Script');
  console.log('- In your Google Sheet, click Tools > Script Editor');
  console.log('- Paste the script provided at end of this file');
  console.log('- Run it to enable email notifications');
}

// Call this once to see setup instructions
window.addEventListener('load', () => {
  if (window.location.hash === '#setup') {
    setupGoogleSheetsIntegration();
  }
});
