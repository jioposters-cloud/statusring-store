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
    
    // Check for deep link
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('product');
    if (productId) {
      const product = allProducts.find(p => p.id == productId);
      if (product) {
        setTimeout(() => showProductDetail(product), 100);
      }
    }
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
        <div class="product-price">â‚¹${p.price}</div>
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

function closeProductModal() {
  const modal = document.getElementById('productModal');
  if (modal) modal.classList.remove('show');
  document.body.style.overflow = 'auto';
  
  // Clear URL parameter for deep linking
  const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
  window.history.pushState({path:newUrl}, '', newUrl);
}

function showProductDetail(product) {
  window.currentProduct = product;
  window.WHATSAPP_NUMBER = WHATSAPP_NUMBER;
  
  // Update URL for deep linking
  const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?product=' + product.id;
  window.history.pushState({path:newUrl}, '', newUrl);
  
  const modal = document.getElementById('productModal');
  if (modal) {
    document.getElementById('detailImage').src = product.thumbnail || 'https://via.placeholder.com/400x400?text=Product';
    document.getElementById('detailName').textContent = product.name;
    document.getElementById('detailSeller').textContent = product.brand || 'Status Ring';
    document.getElementById('detailPrice').textContent = 'â‚¹' + product.price;
    document.getElementById('detailSize').textContent = product.size || 'N/A';
    document.getElementById('detailColor').textContent = product.color || 'N/A';
    document.getElementById('detailBrand').textContent = product.brand || 'Status Ring';
    document.getElementById('detailDescription').textContent = product.description || 'No description available';
    
    // Set up the add to cart button in modal
    const detailBtn = document.getElementById('detailAddToCart');
    if (detailBtn) {
      detailBtn.onclick = () => {
        addToCart(product.id, product.name, product.price, product.thumbnail);
        closeProductModal();
      };
    }
    
    // Set up share button
    const shareBtn = document.getElementById('detailShareBtn');
    if (shareBtn) {
      shareBtn.onclick = async () => {
        const shareUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + '?product=' + product.id;
        if (navigator.share) {
          try {
            await navigator.share({
              title: product.name,
              text: 'Check out ' + product.name + ' on StatusRing Store!',
              url: shareUrl,
            });
          } catch (err) {
            console.error('Error sharing:', err);
          }
        } else {
          navigator.clipboard.writeText(shareUrl).then(() => {
            alert('Link copied to clipboard!');
          }).catch(err => console.error('Copy failed', err));
        }
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
    closeModal.onclick = closeProductModal;
  }
  
  if (modalOverlay) {
    modalOverlay.onclick = closeProductModal;
  }
});

function initStore() {
  allProducts = [];
  filteredProducts = [];
  categories = new Set();
  loadProducts();
}
