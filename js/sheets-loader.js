// Google Sheets to Store Data Loader
// This script fetches product data directly from Google Sheets and updates the store

const SHEETS_CONFIG = {
  // Your Google Sheets ID (from the URL)
  SHEETS_ID: '1PFSwnII1Z-Fd9-QXv3R0fZJJnGw3-rECcq8xXz-ik4s',
  // The sheet name/gid
  RANGE: 'A1:N100',
  // Google Sheets API key (for public sheets)
  API_KEY: 'AIzaSyAx6I7AH_8HPWDc5-4Qs_c3X4MNyUhH4LY'
};

// Fetch data from Google Sheets using CSV export (no API key needed)
function loadProductsFromSheets() {
  console.log('Loading products from Google Sheets...');
  
  // Use Google Sheets CSV export URL
  const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEETS_CONFIG.SHEETS_ID}/export?format=csv`;
  
  fetch(csvUrl)
    .then(response => response.text())
    .then(csvText => {
      const products = parseCSVToProducts(csvText);
      console.log('Loaded ' + products.length + ' products from Google Sheets');
      
      // Replace the global products array
      window.products = products;
      
      // Re-initialize the store with new data
      if (typeof initStore === 'function') {
        initStore();
      }
    })
    .catch(error => {
      console.error('Error loading from Google Sheets:', error);
      console.log('Falling back to local data.js');
    });
}

// Parse CSV data to products array
function parseCSVToProducts(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];
  
  // Parse header
  const headers = parseCSVLine(lines[0]);
  const products = [];
  
  // Get column indices
  const nameIdx = headers.indexOf('Name');
  const categoryIdx = headers.indexOf('Category');
  const priceIdx = headers.indexOf('Price');
  const descriptionIdx = headers.indexOf('Description');
  const sizeIdx = headers.indexOf('Size');
  const colorIdx = headers.indexOf('Color');
  const tagIdx = headers.indexOf('Tag');
  const brandIdx = headers.indexOf('Brand');
  const stockIdx = headers.indexOf('Stock');
  const availabilityIdx = headers.indexOf('Availability');
  const thumbnailIdx = headers.indexOf('Thumbnail');
  const image1Idx = headers.indexOf('Image1');
  const image2Idx = headers.indexOf('Image2');
  
  // Parse products
  for (let i = 1; i < lines.length; i++) {
    const columns = parseCSVLine(lines[i]);
    if (columns[nameIdx] && columns[nameIdx].trim()) {
      const product = {
        id: i,
        name: columns[nameIdx] || 'Product',
        category: columns[categoryIdx] || 'General',
        price: parseFloat((columns[priceIdx] || '0').replace(/,/g, '')) || 0,
        description: columns[descriptionIdx] || '',
        size: columns[sizeIdx] || '',
        color: columns[colorIdx] || 'Multi',
        tag: columns[tagIdx] || '',
        brand: columns[brandIdx] || 'StatusRing',
        stock: parseInt(columns[stockIdx]) || 1000,
        availability: columns[availabilityIdx] || 'Show',
        thumbnail: columns[thumbnailIdx] || 'https://via.placeholder.com/250x200?text=' + encodeURIComponent(columns[nameIdx] || 'Product'),
        image1: columns[image1Idx] || '',
        image2: columns[image2Idx] || ''
      };
      
      if (product.availability === 'Show') {
        products.push(product);
      }
    }
  }
  
  return products;
}

// Parse CSV line handling quotes
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let insideQuotes = false;
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];
    
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

// Load products when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadProductsFromSheets);
} else {
  loadProductsFromSheets();
}
