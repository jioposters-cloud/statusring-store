// Store Configuration
const WHATSAPP_NUMBER = '919714293282';
let allProducts = [];
let filteredProducts = [];
let categories = new Set();

// Utility: Generate URL slug from product name
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[\s]+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// Generate product URL with SEO-friendly slug
function getProductUrl(product) {
  const slug = slugify(product.name);
  return `https://statusring.in/?product=${product.id}&name=${slug}`;
}

// Inject Product JSON-LD structured data for Google Merchant Center
function injectProductJsonLd(product) {
  const jsonLdEl = document.getElementById('productJsonLd');
  if (!jsonLdEl) return;

  const productUrl = getProductUrl(product);
  const productImage = product.thumbnail || product.image1 || '';

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description || `${product.name} - Premium quality poster for clinic & hospital interior. Size: ${product.size || '12x18 inch'}. Brand: Status Ring.`,
    "image": [productImage],
    "brand": {
      "@type": "Brand",
      "name": product.brand || "Status Ring"
    },
    "sku": `SR-${product.id}`,
    "mpn": `SR-${product.id}`,
    "color": product.color || "Multi",
    "size": product.size || "12x18 inch",
    "category": product.category || "Dental Posters",
    "url": productUrl,
    "offers": {
      "@type": "Offer",
      "url": productUrl,
      "priceCurrency": "INR",
      "price": product.price,
      "availability": "https://schema.org/InStock",
      "itemCondition": "https://schema.org/NewCondition",
      "seller": {
        "@type": "Organization",
        "name": "StatusRing"
      },
      "shippingDetails": {
        "@type": "OfferShippingDetails",
        "shippingDestination": {
          "@type": "DefinedRegion",
          "addressCountry": "IN"
        },
        "deliveryTime": {
          "@type": "ShippingDeliveryTime",
          "handlingTime": {
            "@type": "QuantitativeValue",
            "minValue": 1,
            "maxValue": 3,
            "unitCode": "DAY"
          },
          "transitTime": {
            "@type": "QuantitativeValue",
            "minValue": 3,
            "maxValue": 7,
            "unitCode": "DAY"
          }
        }
      },
      "hasMerchantReturnPolicy": {
        "@type": "MerchantReturnPolicy",
        "returnPolicyCategory": "https://schema.org/MerchantReturnFiniteReturnWindow",
        "merchantReturnDays": 7,
        "returnMethod": "https://schema.org/ReturnByMail"
      }
    }
  };

  // Add additional images if available
  if (product.image1 && product.image1 !== productImage) {
    jsonLd.image.push(product.image1);
  }
  if (product.image2 && product.image2.length > 0) {
    jsonLd.image.push(product.image2);
  }

  jsonLdEl.textContent = JSON.stringify(jsonLd);
}

// Clear Product JSON-LD (when closing product detail)
function clearProductJsonLd() {
  const jsonLdEl = document.getElementById('productJsonLd');
  if (jsonLdEl) jsonLdEl.textContent = '';
}

// Update page meta tags dynamically for the product
function updatePageMeta(product) {
  if (!product) {
    // Reset to default
    document.title = 'StatusRing Store | Premium Dental Posters & Clinic Frames';
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.content = 'Buy premium dental posters, clinic frames & patient education materials online at StatusRing.in. 200+ designs for dentists, skin clinics & hospitals.';
    const canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) canonical.href = 'https://statusring.in/';
    const ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.content = 'https://statusring.in/';
    const ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = 'StatusRing Store | Premium Dental Posters & Clinic Frames';
    return;
  }

  const productUrl = getProductUrl(product);
  document.title = `${product.name} | StatusRing Store - Buy Online \u20B9${product.price}`;
  
  const metaDesc = document.querySelector('meta[name="description"]');
  if (metaDesc) metaDesc.content = `Buy ${product.name} online at \u20B9${product.price}. ${product.description || 'Premium quality poster for dental clinic interior.'}. Free shipping - StatusRing.in`;

  const canonical = document.querySelector('link[rel="canonical"]');
  if (canonical) canonical.href = productUrl;

  const ogUrl = document.querySelector('meta[property="og:url"]');
  if (ogUrl) ogUrl.content = productUrl;

  const ogTitle = document.querySelector('meta[property="og:title"]');
  if (ogTitle) ogTitle.content = `${product.name} | StatusRing Store`;

  const ogDesc = document.querySelector('meta[property="og:description"]');
  if (ogDesc) ogDesc.content = `Buy ${product.name} online at \u20B9${product.price}. Premium quality poster. Free shipping.`;

  const ogImage = document.querySelector('meta[property="og:image"]');
  if (ogImage) ogImage.content = product.thumbnail || '';
}

// Load products from data.js
function loadProducts() {
  const sourceProducts = typeof window !== 'undefined' && window.products ? window.products : (typeof products !== 'undefined' ? products : []);
  if (sourceProducts && sourceProducts.length > 0) {
    // Filter: must have name AND category AND price
    allProducts = sourceProducts.filter(p => p && p.name && p.name.trim() && p.category && p.category.trim() && p.price);
    
    allProducts.forEach(p => {
      if (p.category && p.category.trim()) {
        categories.add(p.category.trim());
      }
    });
    
    console.log('Products loaded:', allProducts.length);
    displayCategories();
    displayProducts(allProducts);

    // Check for deep link: ?product=ID
    handleDeepLink();
  } else {
    console.error('No products found');
  }
}

// Handle deep link from URL (?product=ID)
function handleDeepLink() {
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('product');
  
  if (productId) {
    const product = allProducts.find(p => p.id == productId);
    if (product) {
      // Small delay to ensure DOM is ready
      setTimeout(() => showProductDetail(product), 200);
    }
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
        <div class="card-share-icon" onclick="event.stopPropagation(); shareProduct(${p.id}, 'native')" title="Share product">
          <i class="fas fa-share-alt"></i>
        </div>
        <img src="${productImage}" alt="${p.name}" onerror="this.src='https://via.placeholder.com/280x250?text=Product';">
      </div>
      <div class="product-info">
        <h3 class="product-name">${p.name}</h3>
        <p class="product-seller">${sellerName}</p>
        <div class="product-price">\u20B9${p.price}</div>
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
    window.currentProductId = product.id;
    document.getElementById('detailImage').src = product.thumbnail || 'https://via.placeholder.com/600x400?text=Product';
    document.getElementById('detailImage').alt = product.name;
    document.getElementById('detailName').textContent = product.name;
    document.getElementById('detailSeller').textContent = product.brand || 'Status Ring';
    document.getElementById('detailPrice').textContent = '\u20B9' + product.price;
    
    // Set up modal share buttons
    document.getElementById('shareWhatsApp').onclick = () => shareProduct(product.id, 'whatsapp');
    document.getElementById('shareCopyLink').onclick = () => shareProduct(product.id, 'copy');
    document.getElementById('shareNative').onclick = () => shareProduct(product.id, 'native');

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
    
    // Update URL with product deep link (without reload)
    const slug = slugify(product.name);
    const newUrl = `?product=${product.id}&name=${slug}`;
    window.history.pushState({productId: product.id}, product.name, newUrl);

    // Inject Product JSON-LD for Google
    injectProductJsonLd(product);

    // Update page title & meta for SEO
    updatePageMeta(product);
    
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
      // Reset URL and meta to homepage
      window.history.pushState({}, 'StatusRing Store', '/');
      clearProductJsonLd();
      updatePageMeta(null);
    };
  }
  
  if (modalOverlay) {
    modalOverlay.onclick = () => {
      if (modal) modal.classList.remove('show');
      document.body.style.overflow = 'auto';
      // Reset URL and meta to homepage
      window.history.pushState({}, 'StatusRing Store', '/');
      clearProductJsonLd();
      updatePageMeta(null);
    };
  }
});

// Handle browser back/forward button
window.addEventListener('popstate', function(event) {
  const modal = document.getElementById('productModal');
  if (event.state && event.state.productId) {
    const product = allProducts.find(p => p.id == event.state.productId);
    if (product) {
      showProductDetail(product);
      return;
    }
  }
  // Close modal if going back to store
  if (modal) {
    modal.classList.remove('show');
    document.body.style.overflow = 'auto';
    clearProductJsonLd();
    updatePageMeta(null);
  }
});

function initStore() {
  allProducts = [];
  filteredProducts = [];
  categories = new Set();
  loadProducts();
}

// Sharing functionality
function shareProduct(productId, type) {
  const product = allProducts.find(p => p.id == productId);
  if (!product) return;

  const slug = slugify(product.name);
  const url = `${window.location.origin}${window.location.pathname}?product=${product.id}&name=${slug}`;
  const text = `Check out this ${product.name} on StatusRing Store! Price: \u20B9${product.price}`;

  if (type === 'whatsapp') {
    window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
  } else if (type === 'copy') {
    navigator.clipboard.writeText(url).then(() => {
      const feedback = document.getElementById('shareFeedback');
      if (feedback) {
        feedback.textContent = 'Link copied to clipboard!';
        setTimeout(() => feedback.textContent = '', 3000);
      } else {
        alert('Link copied to clipboard!');
      }
    });
  } else if (type === 'native') {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: text,
        url: url
      }).catch(console.error);
    } else {
      shareProduct(productId, 'copy');
    }
  }
}
