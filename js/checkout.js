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
