// ===== IMPROVED RAZORPAY CHECKOUT WITH METADATA & PREFILL =====
// NO customer detail prompts needed - automatically saves & preloads

// 1. GET CART FROM STORAGE
function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

// 2. GET CUSTOMER DETAILS (WITH AUTO-PREFILL FROM LOCAL STORAGE)
function getCustomerDetails() {
  return {
    name: localStorage.getItem('customerName') || 'Guest',
    email: localStorage.getItem('customerEmail') || 'noemail@example.com',
    phone: localStorage.getItem('customerPhone') || '9000000000',
    address: localStorage.getItem('customerAddress') || 'Not provided'
  };
}

// 3. RAZORPAY CHECKOUT WITH METADATA (CRITICAL - SENDS ALL ORDER DATA)
const checkoutRazorpayBtn = document.getElementById('checkoutRazorpay');
const checkoutModal = document.getElementById('checkoutModal');
const closeCheckoutModal = document.getElementById('closeCheckoutModal');
const checkoutModalOverlay = document.getElementById('checkoutModalOverlay');
const checkoutForm = document.getElementById('checkoutForm');

// Close modal handlers
const closeModal = () => {
    if (checkoutModal) checkoutModal.classList.remove('show');
};
if (closeCheckoutModal) closeCheckoutModal.addEventListener('click', closeModal);
if (checkoutModalOverlay) checkoutModalOverlay.addEventListener('click', closeModal);

if (checkoutRazorpayBtn) {
  checkoutRazorpayBtn.addEventListener('click', () => {
    const cart = getCart();
    
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    // Prefill form if data exists
    if (document.getElementById('checkoutName')) {
        document.getElementById('checkoutName').value = localStorage.getItem('customerName') || '';
        document.getElementById('checkoutEmail').value = localStorage.getItem('customerEmail') || '';
        document.getElementById('checkoutPhone').value = localStorage.getItem('customerPhone') || '';
        document.getElementById('checkoutAddress').value = localStorage.getItem('customerAddress') || '';
    }

    // Show modal instead of prompting
    if (checkoutModal) checkoutModal.classList.add('show');
  });
}

// Handle form submission
if (checkoutForm) {
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Save form data to localStorage
        const customerName = document.getElementById('checkoutName').value;
        const customerEmail = document.getElementById('checkoutEmail').value;
        const customerPhone = document.getElementById('checkoutPhone').value;
        const customerAddress = document.getElementById('checkoutAddress').value;

        localStorage.setItem('customerName', customerName);
        localStorage.setItem('customerEmail', customerEmail);
        localStorage.setItem('customerPhone', customerPhone);
        localStorage.setItem('customerAddress', customerAddress);
        
        // Hide modal
        closeModal();

        // Proceed to Razorpay
        triggerRazorpayPayment();
    });
}

function triggerRazorpayPayment() {
    const cart = getCart();
    if (cart.length === 0) return;

    // Get customer details with prefill from previous order
    const customer = getCustomerDetails();
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    // ========== IMPORTANT: RAZORPAY METADATA ==========
    const orderMetadata = {
      products: cart.map((item, idx) => `Product ${idx + 1}: ${item.name} (Qty: ${item.quantity}) - Price: Rs.${item.price * item.quantity}\nImage: ${item.image || 'No image'}`).join('\n\n'),
      customerName: customer.name,
      customerAddress: customer.address,
      customerEmail: customer.email,
      customerPhone: customer.phone,
      orderTotal: total,
      itemCount: cart.length,
      orderTimestamp: new Date().toISOString()
    };
    
    const options = {
      key: 'rzp_live_RycGGdBVVqAFT9',
      amount: total * 100,
      currency: 'INR',
      name: 'StatusRing Store',
      description: 'Premium Dental & Medical Education Posters',
      notes: orderMetadata,
      handler: function(response) {
        processPayment(response, cart, customer, total);
      },
      prefill: {
        name: customer.name,
        email: customer.email,
        contact: customer.phone
      },
      theme: { color: '#FF512F' }
    };
    
    try {
      const rzp1 = new Razorpay(options);
      rzp1.on('payment.failed', function(response) {
        alert('Payment Failed: ' + response.error.description);
        console.log('Failed Payment:', response);
      });
      rzp1.open();
    } catch (error) {
      alert('Payment Error: ' + error.message);
      console.error('Razorpay Error:', error);
    }
}

// 4. PROCESS SUCCESSFUL PAYMENT
function processPayment(response, cart, customer, total) {
  const paymentDetails = {
    orderId: 'order_' + Date.now(),
    customer: customer,
    items: cart,
    total: total,
    paymentId: response.razorpay_payment_id,
    paymentMethod: 'Razorpay',
    timestamp: new Date().toLocaleString()
  };
  
  // Save to localStorage as backup
  localStorage.setItem('lastOrder', JSON.stringify(paymentDetails));
  localStorage.setItem('orderHistory', JSON.stringify([
    ...(JSON.parse(localStorage.getItem('orderHistory')) || []),
    paymentDetails
  ]));
  
  // Log complete order details to console
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

   // SEND ORDER TO FORMSPREE FOR EMAIL NOTIFICATION
 sendEmailViaFormspree(paymentDetails, response);

  console.log('===================================\n');
  
  // NOTE: Formspree email removed - Zapier will handle it automatically
  
  // Clear cart
  localStorage.setItem('cart', JSON.stringify([]));
  
  // Update UI
  if (window.updateCartUI) {
    window.updateCartUI();
  }
  
  // Close cart sidebar
  const cartSidebar = document.getElementById('cartSidebar');
  const cartOverlay = document.getElementById('cartOverlay');
  if (cartSidebar) cartSidebar.classList.remove('open');
  if (cartOverlay) cartOverlay.classList.remove('open');
  
  // Show success notification
  showSuccessNotification(paymentDetails, response);
}

// 5. SHOW SUCCESS NOTIFICATION
function showSuccessNotification(paymentDetails, response) {
  const notification = document.createElement('div');
  notification.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 30px; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); z-index: 3000; text-align: left; max-width: 500px; font-family: Arial, sans-serif;';
  notification.innerHTML = `
    <h2 style="color: #1abc9c; margin-bottom: 15px;">✅ Payment Successful!</h2>
    <p>Thank you for your order.</p>
    <div style="background: #f5f5f5; padding: 15px; border-radius: 5px; margin-bottom: 15px; font-size: 13px;">
      <p style="margin: 5px 0;"><strong>Order ID:</strong> ${paymentDetails.orderId}</p>
      <p style="margin: 5px 0;"><strong>Name:</strong> ${paymentDetails.customer.name}</p>
      <p style="margin: 5px 0;"><strong>Email:</strong> ${paymentDetails.customer.email}</p>
      <p style="margin: 5px 0;"><strong>Phone:</strong> ${paymentDetails.customer.phone}</p>
      <p style="margin: 5px 0;"><strong>Total:</strong> ₹${paymentDetails.total}</p>
      <p style="margin: 5px 0;"><strong>Payment ID:</strong> ${response.razorpay_payment_id}</p>
    </div>
    <p style="margin-bottom: 15px; font-size: 12px; color: #999;">Check your email for order confirmation (via Zapier).</p>
    <button onclick="this.parentElement.remove()" style="background: #1abc9c; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; width: 100%;">Close</button>
  `;
  document.body.appendChild(notification);
}

// SEND ORDER TO FORMSPREE (FIX FOR RAZORPAY AUTO-REFUND)
function sendEmailViaFormspree(paymentDetails, response) {
 const body = `Order Confirmation\nPayment ID: ${response.razorpay_payment_id}\nOrder ID: ${paymentDetails.orderId}\nName: ${paymentDetails.customer.name}\nEmail: ${paymentDetails.customer.email}\nPhone: ${paymentDetails.customer.phone}\nAddress: ${paymentDetails.customer.address}\nTotal: ₹${paymentDetails.total}\n\nItems: ${JSON.stringify(paymentDetails.items)}`;
 
 fetch('https://formspree.io/f/mdakrrab', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({ email: paymentDetails.customer.email, name: paymentDetails.customer.name, message: body })
 })
 .then(() => console.log('✅ Formspree email sent to vendor'))
 .catch(e => console.error('❌ Formspree email failed:', e));
}

// 6. GET ALL ORDERS FROM STORAGE (for admin viewing)
function getAllOrders() {
  return JSON.parse(localStorage.getItem('orderHistory')) || [];
}

// 7. DISPLAY ALL ORDERS IN CONSOLE (for testing)
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
  console.log('Type showAllOrders() to refresh');
  console.log('========================================');
}

// Auto-show orders when page loads if in admin mode
if (window.location.pathname.includes('admin') || window.location.hash === '#admin') {
  window.addEventListener('load', showAllOrders);
}

// ===== WHATSAPP CHECKOUT (EXISTING - NO CHANGES NEEDED) =====
const checkoutWhatsAppBtn = document.getElementById('checkoutWhatsApp');
if (checkoutWhatsAppBtn) {
  checkoutWhatsAppBtn.addEventListener('click', () => {
    const cart = getCart();
    
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    
    const customer = getCustomerDetails();
    const phoneNumber = '919714293282';
    let message = 'Hello StatusRing, I would like to order:%0A%0A';
    
    cart.forEach(item => {
      message += `* ${item.name} (Qty: ${item.quantity}) - ₹${item.price * item.quantity}%0A`;
    });
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `%0A*Total Amount: ₹${total}*%0A%0A*Customer Details:*%0AName: ${customer.name}%0AEmail: ${customer.email}%0APhone: ${customer.phone}%0AAddress: ${customer.address}`;
    
    const order = {
      orderId: 'order_' + Date.now(),
      customer: customer,
      items: cart,
      total: total,
      paymentMethod: 'WhatsApp',
      timestamp: new Date().toLocaleString()
    };
    localStorage.setItem('lastOrder', JSON.stringify(order));
    
    console.log('ORDER DETAILS:', order);
    
    const whatsappURL = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappURL, '_blank');
  });
}

// ===== NOTES FOR IMPLEMENTATION =====
// 
// 1. This code NO LONGER asks for customer details repeatedly
//    - First time: user fills details once
//    - Next time: details are prefilled automatically from localStorage
//    - User can edit if needed
//
// 2. All order data is sent to Razorpay in 'notes' field (metadata)
//    - Razorpay stores it with the payment
//    - Razorpay emails you with all details
//    - Zapier picks it up and forwards to your email + Google Sheet
//
// 3. Formspree email code removed (Zapier handles it better)
//    - Less manual coordination
//    - Zapier auto-formats the email nicely
//    - Zapier also puts data directly in Google Sheet
//
// 4. To verify orders:
//    - Check browser console (F12) for "showAllOrders()"
//    - Check email from Zapier
//    - Check Razorpay dashboard
//    - Check Google Sheet (if Zapier connected)
// 
// ====================================
