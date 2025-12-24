// Shopping Cart Management
let cart = [];

function addToCart(product, quantity, color) {
    const existingItem = cart.find(item => item.id === product.id && item.color === color);
    
    if (existingItem) {
        existingItem.quantity += quantity;
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            price: product.price,
            quantity: quantity,
            color: color,
            image: product.thumbnail
        });
    }
    
    updateCart();
    updateCartUI();
    showNotification('Product added to cart!');
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCart();
    updateCartUI();
}

function updateQuantity(index, quantity) {
    if (quantity <= 0) {
        removeFromCart(index);
    } else {
        cart[index].quantity = quantity;
        updateCart();
        updateCartUI();
    }
}

function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

function loadCart() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
        cart = JSON.parse(savedCart);
        updateCartUI();
    }
}

function updateCartUI() {
    // Update cart count
    const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
    document.getElementById('cartCount').textContent = cartCount;
    
    // Update cart items list
    const cartItemsDiv = document.getElementById('cartItems');
    if (cart.length === 0) {
        cartItemsDiv.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
        return;
    }
    
    cartItemsDiv.innerHTML = '';
    cart.forEach((item, index) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'cart-item';
        
        const info = document.createElement('div');
        info.className = 'cart-item-info';
        
        const itemName = document.createElement('div');
        itemName.className = 'cart-item-name';
        itemName.textContent = item.name + ' (' + item.color + ')';
        info.appendChild(itemName);
        
        const itemPrice = document.createElement('div');
        itemPrice.className = 'cart-item-price';
        itemPrice.textContent = '₹' + (item.price * item.quantity) + ' x' + item.quantity;
        info.appendChild(itemPrice);
        
        itemDiv.appendChild(info);
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'cart-item-remove';
        removeBtn.textContent = 'Remove';
        removeBtn.onclick = () => removeFromCart(index);
        itemDiv.appendChild(removeBtn);
        
        cartItemsDiv.appendChild(itemDiv);
    });
    
    // Update total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    document.getElementById('cartTotal').textContent = '₹' + total;
}

// Cart sidebar toggle
const cartBtn = document.getElementById('cartBtn');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const closeCartBtn = document.getElementById('closeCart');

cartBtn.addEventListener('click', () => {
    cartSidebar.classList.add('open');
    cartOverlay.classList.add('open');
});

closeCartBtn.addEventListener('click', () => {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('open');
});

cartOverlay.addEventListener('click', () => {
    cartSidebar.classList.remove('open');
    cartOverlay.classList.remove('open');
});

function showNotification(message) {
    const notification = document.createElement('div');
    notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #1abc9c; color: white; padding: 15px 20px; border-radius: 5px; z-index: 2000; animation: slideIn 0.3s ease;';
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => notification.remove(), 3000);
}

// Load cart on page load
window.addEventListener('DOMContentLoaded', loadCart);

// CSS for animation
const style = document.createElement('style');
style.textContent = '@keyframes slideIn { from { transform: translateX(400px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }';
document.head.appendChild(style);
