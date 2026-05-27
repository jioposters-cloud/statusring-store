<?php
// api/ucp-catalog.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

// Read the frontend products JS file to avoid duplicate data sources
$js_file = __DIR__ . '/../js/data.js';
$products = [];

if (file_exists($js_file)) {
    $js_content = file_get_contents($js_file);
    
    // Find the products array inside the JS content
    if (preg_match('/var\s+products\s*=\s*\[(.*?)\];/s', $js_content, $matches)) {
        // Prepare to parse loose JS object format to valid JSON
        $json_block = '[' . $matches[1] . ']';
        
        // Add double quotes around keys (e.g. id: -> "id":)
        $json_block = preg_replace('/(\w+)\s*:/', '"$1":', $json_block);
        // Fix trailing commas before brackets if any
        $json_block = preg_replace('/,\s*([\]}])/s', '$1', $json_block);
        
        $products = json_decode($json_block, true);
    }
}

// Fallback to manual minimal definition if parse fails
if (empty($products)) {
    $products = [
        [
            "id" => 1,
            "name" => "Dental Bridge Poster",
            "price" => 450,
            "category" => "Dental Posters",
            "thumbnail" => "https://m.media-amazon.com/images/I/41y1HiZrYtL.jpg"
        ]
    ];
}

// Convert products to UCP Standard Schema
$ucp_products = [];
foreach ($products as $p) {
    if (empty($p['name'])) continue;
    $ucp_products[] = [
        "id" => "SR-" . $p['id'],
        "name" => $p['name'],
        "description" => isset($p['description']) ? $p['description'] : $p['name'],
        "price" => [
            "amount" => number_format((float)$p['price'], 2, '.', ''),
            "currency" => "INR"
        ],
        "images" => [
            isset($p['thumbnail']) ? $p['thumbnail'] : "",
            isset($p['image1']) ? $p['image1'] : ""
        ],
        "availability" => "IN_STOCK",
        "attributes" => [
            "size" => isset($p['size']) ? $p['size'] : "12x18 inch",
            "category" => isset($p['category']) ? $p['category'] : "Dental Posters"
        ]
    ];
}

echo json_encode(["products" => $ucp_products]);
