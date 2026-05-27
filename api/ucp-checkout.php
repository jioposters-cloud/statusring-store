<?php
// api/ucp-checkout.php
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

// 1. Calculate the final order amount
$total = 0.0;
foreach ($items as $item) {
    $price = isset($item['price']['amount']) ? (float)$item['price']['amount'] : 0.0;
    $qty = isset($item['quantity']) ? (int)$item['quantity'] : 1;
    $total += $price * $qty;
}

// 2. Generate a redirect link pointing back to your storefront checkout page
// We pass the cart items dynamically in the query string so your existing page can pick it up!
$cart_params = [];
foreach ($items as $index => $item) {
    $id = str_replace('SR-', '', $item['id']);
    $qty = $item['quantity'];
    $cart_params[] = "item_{$index}={$id}_{$qty}";
}
$param_string = implode('&', $cart_params);

$checkout_handoff_url = "https://statusring.in/?checkout=true&" . $param_string;

// 3. Return the transaction handoff details
$order_id = "SR-UCP-" . time();
$response = [
    "order_id" => $order_id,
    "status" => "PENDING_CUSTOMER_ACTION",
    "redirect_url" => $checkout_handoff_url,
    "message" => "Please complete the payment on the merchant secure portal."
];

echo json_encode($response);
