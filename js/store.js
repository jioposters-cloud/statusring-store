// Store Configuration - Load from Google Sheets
let allProducts = [];
let filteredProducts = [];
let categories = new Set();

const SHEET_ID = '1PFSwnII1Z-Fd9-QXv3R0fZJJnGw3-rECcq8xXz-ik4s';
const SHEET_NAME = 'Products';
const CSV_URL = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${SHEET_NAME}`;

// Parse CSV data
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) return [];
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const products = [];
    
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        if (values.length === 0 || !values[0]) continue;
        
        const product = {};
        headers.forEach((header, index) => {
            product[header] = values[index] || '';
        });
        
        if (product.name) {
            products.push({
                id: i,
                name: product.name,
                category: product.category || 'General',
                price: parseFloat(product.price) || 0,
                description: product.description || '',
                size: product.size || '',
                color: product.color || '',
                tag: product.tag || '',
                brand: product.brand || 'StatusRing',
                stock: parseInt(product.stock) || 100,
                availability: product.availability || 'Show',
                thumbnail: `https://via.placeholder.com/250x200?text=${encodeURIComponent(product.name)}`,
                image1: '',
                image2: ''
            });
        }
    }
    
    return products;
}

function parseCSVLine(line) {
    const result = [];
    let current = '';
    let insideQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            if (insideQuotes && line[i + 1] === '"') {
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

async function loadProducts() {
    try {
        console.log('Loading from:', CSV_URL);
        const response = await fetch(CSV_URL);
        const csvText = await response.text();
        
        allProducts = parseCSV(csvText);
        
        if (allProducts.length > 0) {
            allProducts.forEach(p => {
                if (p.category) categories.add(p.category);
            });
            
            console.log('Products loaded:', allProducts.length);
            console.log('Categories:', Array.from(categories));
            
            displayCategories();
            displayProducts(allProducts);
        } else {
            console.error('No products');
            document.getElementById('categorySections').innerHTML = '<p>No products found</p>';
        }
    } catch (error) {
        console.error('Error:', error);
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
    
    products.forEach(p => {
        const html = `<div class="product-card"><div class="product-image"><img src="${p.thumbnail}" alt="${p.name}"></div><div class="product-info"><h3>${p.name}</h3><p>${p.category}</p><p>${p.description}</p><div class="product-footer"><span>Rs ${p.price}</span><button onclick="addToCart(${p.id},'${p.name}',${p.price},'${p.thumbnail}')">Add</button></div></div></div>`;
        section.innerHTML += html;
    });
}

function searchProducts() {
    const q = document.getElementById('searchInput').value.toLowerCase();
    filteredProducts = allProducts.filter(p => 
        p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q)
    );
    displayProducts(filteredProducts);
}

window.addEventListener('DOMContentLoaded', loadProducts);
