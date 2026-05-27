<?php
// api/ucp-shopping.php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$items = isset($input['cart']['items']) ? $input['cart']['items'] : [];

$subtotal = 0.0;
foreach ($items as $item) {
    $price = isset($item['price']['amount']) ? (float)$item['price']['amount'] : 0.0;
    $qty = isset($item['quantity']) ? (int)$item['quantity'] : 1;
    $subtotal += $price * $qty;
}

// StatusRing operates on Free Shipping in India!
$shipping = 0.00;
$tax = 0.00;
$total = $subtotal + $shipping + $tax;

$response = [
    "cart" => [
        "items" => $items,
        "totals" => [
            "subtotal" => ["amount" => number_format($subtotal, 2, '.', ''), "currency" => "INR"],
            "shipping" => ["amount" => number_format($shipping, 2, '.', ''), "currency" => "INR"],
            "tax" => ["amount" => number_format($tax, 2, '.', ''), "currency" => "INR"],
            "total" => ["amount" => number_format($total, 2, '.', ''), "currency" => "INR"]
        ]
    ]
];

echo json_encode($response);
