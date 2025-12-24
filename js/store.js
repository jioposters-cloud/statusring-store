// Google Sheets Configuration
const SHEET_ID = '1PFSwnII1Z-Fd9-QXv3R0fZJJnGw3-rECcq8xXz-ik4s';
const SHEET_RANGE = 'Products!A:O';
const API_KEY = 'AIzaSyA-dZvMBZhNxIlwh9g0DRZPE7YbA6_vP0w'; // Public API key for Google Sheets

let allProducts = [];
let filteredProducts = [];
let categories = new Set();

// Fetch data from Google Sheets
async function fetchProducts() {
    try {
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/${SHEET_RANGE}?key=${API_KEY}`;
        const response = await fetch(url);
        const data = await response.json();
        
        if (data.values) {
            const headers = data.values[0];
            allProducts = data.values.slice(1).map((row, index) => ({
                id: index,
                name: row[0] || '',
                category: row[1] || '',
                price: parseFloat(row[2]) || 0,
                description: row[3] || '',
                size: row[4] || '',
                color: row[5] || '',
                tag: row[6] || '',
                brand: row[7] || '',
                stock: parseInt(row[8]) || 0,
                availability: row[9] || 'Show',
                thumbnail: row[10] || 'https://via.placeholder.com/250x200?text=No+Image',
                image1: row[11] || '',
                image2: row[12] || ''
            })).filter(p => p.name.trim() !== '');
            
            // Extract categories
            allProducts.forEach(p => {
                if (p.category) categories.add(p.category);
            });
            
            displayCategories();
            displayProducts(allProducts);
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        document.getElementById('categorySections').innerHTML = '<p class="loading">Error loading products. Please check your Google Sheets connection.</p>';
    }
}

// Display categories
function displayCategories() {
    const categoriesContainer = document.getElementById('categoriesContainer');
    categoriesContainer.innerHTML = '';
    
    const allBtn = document.createElement('button');
    allBtn.className = 'category-btn active';
    allBtn.textContent = 'All';
    allBtn.onclick = () => {
        filterByCategory('All');
        document.querySelectorAll('.category-btn').forEach(btn => btn.classList.remove('active'));
        allBtn.classList.add('active');
    };
    categoriesContainer.appendChild(allBtn);
    
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
    
    const image = document.createElement('div');
    image.className = 'product-image';
    const img = document.createElement('img');
    img.src = product.thumbnail || 'https://via.placeholder.com/250x200?text=' + encodeURIComponent(product.name);
    img.alt = product.name;
    image.appendChild(img);
    card.appendChild(image);
    
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
document.getElementById('searchBtn').addEventListener('click', () => {
    const query = document.getElementById('searchInput').value.toLowerCase();
    filteredProducts = allProducts.filter(p => 
        p.name.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.category.toLowerCase().includes(query)
    );
    displayProducts(filteredProducts);
});

document.getElementById('searchInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        document.getElementById('searchBtn').click();
    }
});

// Initialize
window.addEventListener('DOMContentLoaded', fetchProducts);
