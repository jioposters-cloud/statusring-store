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
        section.innerHTML = '<p style="text-align:center; padding:20px;">No products</p>';
        return;
    }
    
    products.forEach(p => {
        const html = `<div class="product-card"><div class="product-image"><img src="${p.thumbnail}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/250x200?text=${encodeURIComponent(p.name)}';" style="width:100%; height:200px; object-fit:cover;"></div><div class="product-info"><h3>${p.name}</h3><p class="category">${p.category}</p><p>${p.description}</p><div class="product-footer"><span class="price" style="font-weight:bold; color:#333;">₹${p.price}</span><button class="add-to-cart-btn" onclick="addToCart(${p.id},'${p.name}',${p.price},'${p.thumbnail}')">Add Cart</button></div></div></div>`;
        section.innerHTML += html;
    });
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
