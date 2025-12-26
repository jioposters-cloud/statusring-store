// Store Configuration
const WHATSAPP_NUMBER = '919714293282';
let allProducts = [];
let filteredProducts = [];
let categories = new Set();

// Load products from data.js
function loadProducts() {
  if (typeof products !== 'undefined' && products.length > 0) {
    // Filter: must have name AND category AND price
    allProducts = products.filter(p => p && p.name && p.name.trim() && p.category && p.category.trim() && p.price);
    
    allProducts.forEach(p => {
      if (p.category && p.category.trim()) {
        categories.add(p.category.trim());
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
    const sellerName = p.brand || 'Status Ring';
    const productImage = p.thumbnail || 'https://via.placeholder.com/280x250?text=Product';
    
    const card = document.createElement('div');
    card.className = 'product-card';
    card.style.cursor = 'pointer';
    card.innerHTML = `
      <div class="product-image">
        <img src="${productImage}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/280x250?text=Product';">
      </div>
      <div class="product-info">
        <h3 class="product-name">${p.name}</h3>
        <p class="product-seller">${sellerName}</p>
        <div class="product-price">₹${p.price}</div>
        <button class="add-to-cart-btn" onclick="event.stopPropagation(); addToCart(${p.id},'${p.name.replace(/'/g, '&apos;')}',${p.price},'${productImage.replace(/'/g, '&apos;')}')">Add to cart</button>
      </div>
    `;
    
    card.onclick = () => showProductDetail(p);
    grid.appendChild(card);
  });
  
  section.appendChild(grid);
}

function searchProducts() {
  const q = document.getElementById('searchInput').value.toLowerCase();
  if (q.length === 0) {
    filteredProducts = allProducts;
  } else {
    filteredProducts = allProducts.filter(p => 
      (p.name && p.name.toLowerCase().includes(q)) || 
      (p.category && p.category.toLowerCase().includes(q)) ||
      (p.description && p.description.toLowerCase().includes(q))
    );
  }
  displayProducts(filteredProducts);
}

function showProductDetail(product) {
  window.currentProduct = product;
  window.WHATSAPP_NUMBER = WHATSAPP_NUMBER;
  
  const modal = document.getElementById('productModal');
  if (modal) {
    document.getElementById('detailImage').src = product.thumbnail || 'https://via.placeholder.com/400x400?text=Product';
    document.getElementById('detailName').textContent = product.name;
    document.getElementById('detailSeller').textContent = product.brand || 'Status Ring';
    document.getElementById('detailPrice').textContent = '₹' + product.price;
    document.getElementById('detailSize').textContent = product.size || 'N/A';
    document.getElementById('detailColor').textContent = product.color || 'N/A';
    document.getElementById('detailBrand').textContent = product.brand || 'Status Ring';
    document.getElementById('detailDescription').textContent = product.description || 'No description available';
    
    // Set up the add to cart button in modal
    const detailBtn = document.getElementById('detailAddToCart');
    if (detailBtn) {
      detailBtn.onclick = () => {
        addToCart(product.id, product.name, product.price, product.thumbnail);
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
      };
    }
    
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

window.addEventListener('DOMContentLoaded', function() {
  loadProducts();
  
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', searchProducts);
  }
  
  const closeModal = document.getElementById('closeModal');
  const modalOverlay = document.getElementById('modalOverlay');
  const modal = document.getElementById('productModal');
  
  if (closeModal) {
    closeModal.onclick = () => {
      if (modal) modal.classList.remove('show');
      document.body.style.overflow = 'auto';
    };
  }
  
  if (modalOverlay) {
    modalOverlay.onclick = () => {
      if (modal) modal.classList.remove('show');
      document.body.style.overflow = 'auto';
    };
  }
});

function initStore() {
  allProducts = [];
  filteredProducts = [];
  categories = new Set();
  loadProducts();
}
