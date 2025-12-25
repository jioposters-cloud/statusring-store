// Store Configuration - Load from data.js
let allProducts = [];
let filteredProducts = [];
let categories = new Set();

// Load products from data.js
function loadProducts() {
  if (typeof products !== 'undefined' && products.length > 0) {
    allProducts = products;
    
    allProducts.forEach(p => {
      if (p.category) {
        categories.add(p.category);
      }
    });
    
    console.log('Products loaded:', allProducts.length);
    displayCategories();
    displayProducts(allProducts);
  } else {
    console.error('No products found');
  }
}

function displayCategories() {
  const container = document.getElementById('categoriesContainer');
  if (!container) return;
  
  container.innerHTML = '';
  const sorted = Array.from(categories).sort();
  
  const btn = document.createElement('button');
  btn.className = 'category-btn active';
  btn.textContent = 'All';
  btn.onclick = () => filterByCategory('all');
  container.appendChild(btn);
  
  sorted.forEach(cat => {
    const b = document.createElement('button');
    b.className = 'category-btn';
    b.textContent = cat;
    b.onclick = () => filterByCategory(cat);
    container.appendChild(b);
  });
}

function filterByCategory(cat) {
  document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
  event.target.classList.add('active');
  
  if (cat === 'all') {
    filteredProducts = allProducts;
  } else {
    filteredProducts = allProducts.filter(p => p.category === cat);
  }
  
  displayProducts(filteredProducts);
}

function displayProducts(products) {
  const section = document.getElementById('categorySections');
  section.innerHTML = '';
  
  if (products.length === 0) {
    section.innerHTML = '<div class="loading">No products found</div>';
    return;
  }
  
  const grid = document.createElement('div');
  grid.className = 'products-grid';
  
  products.forEach(p => {
    const sellerName = p.seller || 'Status Ring';
    const productImage = p.thumbnail || 'https://via.placeholder.com/280x250?text=Product';
    
    const card = document.createElement('div');
    card.className = 'product-card';
    card.innerHTML = `
      <div class="product-image">
        <img src="${productImage}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/280x250?text=Product';">
      </div>
      <div class="product-info">
        <h3 class="product-name">${p.name}</h3>
        <p class="product-seller">${sellerName}</p>
        <div class="product-price">₹${p.price}</div>
        <button class="add-to-cart-btn" onclick="addToCart(${p.id},'${p.name.replace(/'/g, '&apos;')}',${p.price},'${productImage.replace(/'/g, '&apos;')}')">Add to cart</button>
      </div>
    `;
    grid.appendChild(card);
  });
  
  section.appendChild(grid);
}

function searchProducts() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  filteredProducts = allProducts.filter(p => 
    p.name.toLowerCase().includes(q) || 
    p.category.toLowerCase().includes(q)
  );
  displayProducts(filteredProducts);
}

window.addEventListener('DOMContentLoaded', loadProducts);

// Initialize store function - can be called by sheets-loader to reinit with new data
function initStore() {
  // Reset state
  allProducts = [];
  filteredProducts = [];
  categories = new Set();
  
  // Reload and display
  loadProducts();
}
