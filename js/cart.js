// Shopping Cart Management
let cart = [];

function addToCart(id, name, price, image) {
  const existingItem = cart.find(item => item.id === id);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: id,
      name: name,
      price: price,
      quantity: 1,
      image: image
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
  const countEl = document.getElementById('cartCount');
  if (countEl) {
    countEl.textContent = cartCount;
  }
  
  // Update cart items list
  const cartItemsDiv = document.getElementById('cartItems');
  if (!cartItemsDiv) return;
  
  if (cart.length === 0) {
    cartItemsDiv.innerHTML = '<p class="empty-cart">Your cart is empty</p>';
    const totalEl = document.getElementById('cartTotal');
    if (totalEl) totalEl.textContent = '₹0';
    return;
  }
  
  cartItemsDiv.innerHTML = '';
  cart.forEach((item, index) => {
    const itemDiv = document.createElement('div');
    itemDiv.className = 'cart-item';
    
    const itemHTML = `
      <div class="cart-item-header">
        <div class="cart-item-image">
          <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/60x60?text=Product';">
        </div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">₹${item.price}</div>
          <div class="cart-item-quantity">Qty: ${item.quantity}</div>
        </div>
      </div>
      <button class="cart-item-remove" onclick="removeFromCart(${index})">Remove</button>
    `;
    
    itemDiv.innerHTML = itemHTML;
    cartItemsDiv.appendChild(itemDiv);
  });
  
  // Update total
  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const totalEl = document.getElementById('cartTotal');
  if (totalEl) totalEl.textContent = '₹' + total;
}

// Cart sidebar toggle
const cartBtn = document.getElementById('cartBtn');
const cartSidebar = document.getElementById('cartSidebar');
const cartOverlay = document.getElementById('cartOverlay');
const closeCartBtn = document.getElementById('closeCart');

if (cartBtn && cartSidebar && cartOverlay && closeCartBtn) {
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
}

function showNotification(message) {
  const notification = document.createElement('div');
  notification.style.cssText = 'position: fixed; top: 20px; right: 20px; background: #26a69a; color: white; padding: 15px 20px; border-radius: 5px; z-index: 2000; animation: slideIn 0.3s ease;';
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
