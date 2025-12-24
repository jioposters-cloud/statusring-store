// Google Sheets Configuration
const SHEET_ID = '1PFSwnII1Z-Fd9-QXv3R0fZJJnGw3-rECcq8xXz-ik4s';
// Using Google Sheets CSV export - more reliable than API
const SHEET_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=1878601810`;

let allProducts = [];
let filteredProducts = [];
let categories = new Set();

// Fetch data from Google Sheets using CSV export
async function fetchProducts() {
    try {
        const response = await fetch(SHEET_URL);
        const csvText = await response.text();
        const rows = csvText.trim().split('\n');
        
        if (rows.length > 0) {
            // Parse CSV
            allProducts = rows.slice(1).map((row, index) => {
                const cols = parseCSVRow(row);
                return {
                    id: index,
                    name: cols[0] || '',
                    category: cols[1] || '',
                    price: parseFloat(cols[2]) || 0,
                    description: cols[3] || '',
                    size: cols[4] || '',
                    color: cols[5] || '',
                    tag: cols[6] || '',
                    brand: cols[7] || '',
                    stock: parseInt(cols[8]) || 0,
                    availability: cols[9] || 'Show',
                    thumbnail: cols[10] || 'https://via.placeholder.com/250x200?text=No+Image',
                    image1: cols[11] || '',
                    image2: cols[12] || ''
                };
            }).filter(p => p.name.trim() !== '');
            
            // Extract categories
            allProducts.forEach(p => {
                if (p.category) categories.add(p.category);
            });
            
            console.log('Products loaded:', allProducts.length);
            console.log('Categories:', Array.from(categories));
            
            displayCategories();
            displayProducts(allProducts);
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        document.getElementById('categorySections').innerHTML = '<p class="loading">Error loading products. Please check console for details.</p>';
    }
}

// Parse CSV row handling quoted values
function parseCSVRow(row) {
    const result = [];
    let current = '';
    let insideQuotes = false;
    
    for (let i = 0; i < row.length; i++) {
        const char = row[i];
        const nextChar = row[i + 1];
        
        if (char === '"') {
            if (insideQuotes && nextChar === '"') {
                current += '"';
                i++;
            } else {
                insideQuotes = !insideQuotes;
            }
        } else if (char === ',' && !insideQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current.trim());
    return result;
}

// Display categories
function displayCategories() {
    const categoriesContainer = document.getElementById('categoriesContainer');
    if (!categoriesContainer) return;
    
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
    
    const image = document.createElement('div');
    image.className = 'product-image';
    const img = document.createElement('img');
    img.src = product.thumbnail || 'https://via.placeholder.com/250x200?text=' + encodeURIComponent(product.name);
    img.alt = product.name;
    img.onerror = () => { img.src = 'https://via.placeholder.com/250x200?text=' + encodeURIComponent(product.name); };
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
    
    // Initialize
    fetchProducts();
});

// Initial load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', fetchProducts);
} else {
    fetchProducts();
}
