// ===== CHECKOUT FORM JAVASCRIPT =====
let currentStep = 1, cart = [], customerDetails = {};
const RAZORPAY_KEY = 'rzp_live_RycGGdBVVqAFT9';
const FORMSPREE_ENDPOINT = 'https://formspree.io/f/mdakrrab';

window.addEventListener('DOMContentLoaded', () => { loadCart(); prefillForm(); renderCartReview(); renderOrderSummary(); });

function loadCart() { 
  cart = JSON.parse(localStorage.getItem('cart')) || []; 
  if(cart.length === 0) { alert('Cart empty!'); window.location.href = '/'; } 
}

function prefillForm() { 
  ['customerName', 'customerEmail', 'customerPhone', 'customerAddress', 'customerCity'].forEach(f => {
    const val = localStorage.getItem(f);
    if(val && document.getElementById(f)) document.getElementById(f).value = val;
  });
}

function renderCartReview() { 
  let html = ''; 
  cart.forEach(item => html += `<li style=\"padding:0.5rem 0;border-bottom:1px solid #eee\"><strong>${item.name}</strong> x${item.quantity} = <strong>₹${(item.price * item.quantity).toLocaleString()}</strong></li>`);
  document.getElementById('cart-items-review').innerHTML = `<ul style=\"list-style:none\">${html}</ul>`;
}

function renderOrderSummary() { 
  let html = ''; 
  let total = 0; 
  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    html += `<div class=\"order-item\"><span>${item.name} x${item.quantity}</span><span>₹${itemTotal.toLocaleString()}</span></div>`;
  });
  document.getElementById('order-items-summary').innerHTML = html;
  document.getElementById('total-amount').textContent = '₹' + total.toLocaleString();
}

function goToStep(stepNumber) { 
  document.querySelectorAll('.step-content').forEach(el => el.classList.add('hidden'));
  document.querySelectorAll('.step').forEach(el => el.classList.remove('active','completed'));
  document.getElementById('step' + stepNumber).classList.remove('hidden');
  for(let i = 1; i < stepNumber; i++) document.getElementById('step' + i + '-label').classList.add('completed');
  document.getElementById('step' + stepNumber + '-label').classList.add('active');
  currentStep = stepNumber;
  window.scrollTo(0, 0);
}

function validateAndGoToStep(stepNumber) { 
  const form = document.getElementById('address-form');
  if(!form.checkValidity()) { alert('Please fill required fields'); return; }
  customerDetails = {
    name: document.getElementById('customerName').value,
    email: document.getElementById('customerEmail').value,
    phone: document.getElementById('customerPhone').value,
    address: document.getElementById('customerAddress').value,
    city: document.getElementById('customerCity').value
  };
  Object.keys(customerDetails).forEach(key => localStorage.setItem('customer' + key.charAt(0).toUpperCase() + key.slice(1), customerDetails[key]));
  displayCustomerSummary();
  goToStep(stepNumber);
}

function displayCustomerSummary() { 
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const html = `<strong>Customer Details:</strong><br>Name: ${customerDetails.name}<br>Email: ${customerDetails.email}<br>Phone: ${customerDetails.phone}<br>Address: ${customerDetails.address}<br>City: ${customerDetails.city}<br><br><strong>Total: ₹${total.toLocaleString()}</strong>`;
  document.getElementById('customer-summary').innerHTML = html;
}

function proceedToPayment() { 
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const orderData = { customerName: customerDetails.name, customerEmail: customerDetails.email, customerPhone: customerDetails.phone, customerAddress: customerDetails.address, customerCity: customerDetails.city, cartItems: JSON.stringify(cart), totalAmount: total };
  const options = {
    key: RAZORPAY_KEY, amount: total * 100, currency: 'INR', name: 'StatusRing Store', description: 'Order for ' + cart.length + ' items',
    prefill: { name: customerDetails.name, email: customerDetails.email, contact: customerDetails.phone },
    notes: orderData,
    handler: (response) => handlePaymentSuccess(response, orderData),
    modal: { ondismiss: () => alert('Payment cancelled') }
  };
  const rzp = new Razorpay(options);
  rzp.open();
}

function handlePaymentSuccess(response, orderData) { 
  alert('Payment successful! ID: ' + response.razorpay_payment_id);
  sendEmailViaFormspree(orderData, response.razorpay_payment_id);
  localStorage.removeItem('cart');
  window.location.href = '/thank-you.html';
}

function sendEmailViaFormspree(orderData, paymentId) { 
  const body = `Order Confirmation\nPayment ID: ${paymentId}\nName: ${orderData.customerName}\nEmail: ${orderData.customerEmail}\nPhone: ${orderData.customerPhone}\nAddress: ${orderData.customerAddress}, ${orderData.customerCity}\nTotal: ₹${orderData.totalAmount}`;
  fetch(FORMSPREE_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: orderData.customerEmail, name: orderData.customerName, message: body })
  }).then(() => console.log('Email sent')).catch(e => console.error('Email failed:', e));
}
