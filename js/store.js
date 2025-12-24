// Store Configuration - Load from data.js

let allProducts = [];
let filteredProducts = [];
let categories = new Set();

// Load products from data.js
function loadProducts() {
    // products is defined in data.js
    if (typeof products !== 'undefined' && products.length > 0) {
        allProducts = products;
        
        // Extract unique categories
        allProducts.forEach(p => {
            if (p.category) {
                categories.add(p.category);
            }
        });
        
        console.log('Products loaded:', allProducts.length);
        console.log('Categories:', Array.from(categories));
        
        displayCategories();
        displayProducts(allProducts);
    } else {
        console.error('No products found in data.js');
        document.getElementById('categorySections').innerHTML = '<p class="loading">No products loaded. Please check data.js</p>';
    }
}

// Display categories
function displayCategories() {
    const categoriesContainer = document.getElementById('categoriesContainer');
    if (!categoriesContainer) return;
    
    categoriesContainer.innerHTML = '';
    
    // Add "All" button
    const allBtn = document.createElement('button');
    allBtn.className = 'category-btn active';
    allBtn.textContent = 'All';
    allBtn.onclick = () => {
        filterByCategory('All');
        document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
        allBtn.classList.add('active');
    };
    categoriesContainer.appendChild(allBtn);
    
    // Add category buttons
    Array.from(categories).sort().forEach(category => {
        const btn = document.createElement('button');
        btn.className = 'category-btn';
        btn.textContent = category;
        btn.onclick = () => {
            filterByCategory(category);
            document.querySelectorAll('.category-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
        };
        categoriesContainer.appendChild(btn);
    });
}

// Filter products by category
function filterByCategory(category) {
    if (category === 'All') {
        filteredProducts = [...allProducts];
    } else {
        filteredProducts = allProducts.filter(p => p.category === category);
    }
    displayProducts(filteredProducts);
}

// Display products
function displayProducts(products) {
    const sectionsContainer = document.getElementById('categorySections');
    if (!sectionsContainer) return;
    
    sectionsContainer.innerHTML = '';
    
    if (products.length === 0) {
        sectionsContainer.innerHTML = '<p class="empty-cart">No products found</p>';
        return;
    }
    
    // Group by category
    const grouped = {};
    products.forEach(p => {
        if (!grouped[p.category]) grouped[p.category] = [];
        grouped[p.category].push(p);
    });
    
    // Display each category
    Object.keys(grouped).sort().forEach(category => {
        const section = document.createElement('div');
        section.className = 'category-section';
        
        const title = document.createElement('h2');
        title.className = 'section-title';
        title.textContent = category;
        section.appendChild(title);
        
        const grid = document.createElement('div');
        grid.className = 'products-grid';
        
        grouped[category].forEach(product => {
            const card = createProductCard(product);
            grid.appendChild(card);
        });
        
        section.appendChild(grid);
        sectionsContainer.appendChild(section);
    });
}

// Create product card
function createProductCard(product) {
    const card = document.createElement('div');
    card.className = 'product-card';
    
    // Image
    const image = document.createElement('div');
    image.className = 'product-image';
    const img = document.createElement('img');
    img.src = product.thumbnail || 'https://via.placeholder.com/250x200?text=' + encodeURIComponent(product.name);
    img.alt = product.name;
    img.onerror = () => { img.src = 'https://via.placeholder.com/250x200?text=' + encodeURIComponent(product.name); };
    image.appendChild(img);
    card.appendChild(image);
    
    // Info
    const info = document.createElement('div');
    info.className = 'product-info';
    
    const name = document.createElement('div');
    name.className = 'product-name';
    name.textContent = product.name;
    info.appendChild(name);
    
    const price = document.createElement('div');
    price.className = 'product-price';
    price.textContent = '₹' + product.price;
    info.appendChild(price);
    
    const description = document.createElement('div');
    description.className = 'product-description';
    description.textContent = product.description || product.size || '';
    info.appendChild(description);
    
    // Footer
    const footer = document.createElement('div');
    footer.className = 'product-footer';
    
    const colorSelect = document.createElement('select');
    colorSelect.className = 'color-select';
    colorSelect.innerHTML = '<option value="' + (product.color || 'Default') + '">' + (product.color || 'Color') + '</option>';
    footer.appendChild(colorSelect);
    
    const quantityInput = document.createElement('input');
    quantityInput.type = 'number';
    quantityInput.className = 'quantity-input';
    quantityInput.value = '1';
    quantityInput.min = '1';
    quantityInput.max = product.stock || 100;
    footer.appendChild(quantityInput);
    info.appendChild(footer);
    
    const addBtn = document.createElement('button');
    addBtn.className = 'add-to-cart-btn';
    addBtn.textContent = 'Add to Cart';
    addBtn.onclick = () => addToCart(product, parseInt(quantityInput.value), colorSelect.value);
    info.appendChild(addBtn);
    
    card.appendChild(info);
    return card;
}

// Search functionality
document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('searchBtn');
    const searchInput = document.getElementById('searchInput');
    
    if (searchBtn) {
        searchBtn.addEventListener('click', () => {
            const query = searchInput.value.toLowerCase();
            filteredProducts = allProducts.filter(p => 
                p.name.toLowerCase().includes(query) ||
                p.description.toLowerCase().includes(query) ||
                p.category.toLowerCase().includes(query)
            );
            displayProducts(filteredProducts);
        });
    }
    
    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                searchBtn.click();
            }
        });
    }
    
    loadProducts();
});

// Initial load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadProducts);
} else {
    loadProducts();
}
