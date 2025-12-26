// Checkout functionality with WhatsApp & Razorpay

// This "delegated" listener works even if the button is loaded late
document.addEventListener('click', function (e) {
    if (e.target && (e.target.id === 'checkoutWhatsApp' || e.target.closest('#checkoutWhatsApp'))) {
        
        const cart = JSON.parse(localStorage.getItem('cart')) || [];
        if (cart.length === 0) {
            alert('Your cart is empty!');
            return;
        }

        const phoneNumber = '919714293282'; 
        let message = 'Hello StatusRing, I would like to order:%0A%0A';
        
        cart.forEach(item => {
            message += `* ${item.name} (Qty: ${item.quantity}) - ₹${item.price * item.quantity}%0A`;
        });

        const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        message += `%0A*Total Amount: ₹${total}*`;

        const whatsappURL = `https://wa.me/${phoneNumber}?text=${message}`;
        window.open(whatsappURL, '_blank');
    }
})

// Razorpay Checkout
const checkoutRazorpayBtn = document.getElementById('checkoutRazorpay');
if (checkoutRazorpayBtn) {
    checkoutRazorpayBtn.addEventListener('click', () => {
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }
    
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    
    const options = {
        key: 'rzp_test_1DP5mmOlF5G0d4', // Replace with your Razorpay Key ID
        amount: total * 100, // Amount in paise
        currency: 'INR',
        name: 'StatusRing Store',
        description: 'Buy Premium Dental & Medical Education Posters',
        order_id: 'order_' + Date.now(),
        handler: function(response) {
            processPayment(response);
        },
        prefill: {
            name: '',
            email: '',
            contact: ''
        },
        theme: {
            color: '#1abc9c'
        }
    };
    
    const rzp1 = new Razorpay(options);
    
    rzp1.on('payment.failed', function(response) {
        alert('Payment Failed: ' + response.error.description);
    });
    
    rzp1.open();
});
    }

function processPayment(response) {
    const paymentDetails = {
        items: cart,
        total: cart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        paymentId: response.razorpay_payment_id,
        timestamp: new Date().toLocaleString()
    };
    
    // Save payment details
    localStorage.setItem('lastPayment', JSON.stringify(paymentDetails));
    
    // Clear cart
    cart = [];
    updateCart();
    updateCartUI();
    
    // Close cart sidebar
    document.getElementById('cartSidebar').classList.remove('open');
    document.getElementById('cartOverlay').classList.remove('open');
    
    // Show success message
    const notification = document.createElement('div');
    notification.style.cssText = 'position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); background: white; padding: 30px; border-radius: 10px; box-shadow: 0 10px 30px rgba(0,0,0,0.3); z-index: 3000; text-align: center; max-width: 400px;';
    notification.innerHTML = `
        <h2 style="color: #1abc9c; margin-bottom: 15px;">Payment Successful!</h2>
        <p style="margin-bottom: 20px; color: #666;">Thank you for your order.</p>
        <p style="font-size: 14px; color: #999;">Payment ID: ${response.razorpay_payment_id}</p>
        <button onclick="this.parentElement.remove()" style="background: #1abc9c; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer;">Close</button>
    `;
    document.body.appendChild(notification);
    
    // Optional: Send confirmation via email/API
    sendOrderConfirmation(paymentDetails);
}

function sendOrderConfirmation(details) {
    // This is a placeholder - integrate with your backend API
    console.log('Order confirmed:', details);
    // You can send this data to your backend server
    // fetch('your-backend-url/confirm-order', { method: 'POST', body: JSON.stringify(details) })
}
