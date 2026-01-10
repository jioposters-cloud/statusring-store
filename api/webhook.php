  <?php
header('Content-Type: application/json');

$key_secret = $_ENV['RAZORPAY_KEY_SECRET'];

// Get webhook data
$webhook_data = file_get_contents('php://input');
$webhook_signature = $_SERVER['HTTP_X_RAZORPAY_SIGNATURE'] ?? '';

// Verify signature
$expected_signature = hash_hmac('sha256', $webhook_data, $key_secret);

if ($webhook_signature !== $expected_signature) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid signature']);
    exit;
}

$data = json_decode($webhook_data, true);
$event = $data['event'] ?? '';

// Process payment success
if ($event === 'payment.authorized') {
    $payment = $data['payload']['payment']['entity'];
    $payment_id = $payment['id'];
    $order_id = $payment['order_id'];
    $amount = $payment['amount'] / 100; // Convert paise to rupees
    
    // Send email via Formspree
    $email_data = [
        'from_name' => $payment['customer_details']['name'] ?? 'Customer',
        'from_email' => $payment['email'],
        'message' => "Payment of ₹$amount completed. Order ID: $order_id, Payment ID: $payment_id"
    ];
    
    // POST to Formspree
    $ch = curl_init();
    curl_setopt_array($ch, [
        CURLOPT_URL => 'https://formspree.io/f/' . $_ENV['FORMSPREE_ID'],
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($email_data),
        CURLOPT_HTTPHEADER => ['Content-Type: application/json']
    ]);
    curl_exec($ch);
    curl_close($ch);
    
    // Log to Google Sheets via Sheets API
    logToGoogleSheets($order_id, $amount, $payment_id, $payment['email']);
    
    http_response_code(200);
    echo json_encode(['status' => 'success']);
}

// Process payment failure
elseif ($event === 'payment.failed') {
    // Handle failed payment
    http_response_code(200);
    echo json_encode(['status' => 'payment failed']);
}

else {
    http_response_code(200);
    echo json_encode(['status' => 'event processed']);
}

function logToGoogleSheets($order_id, $amount, $payment_id, $email) {
    // Implement Google Sheets logging if needed
    // For now, this is a placeholder
}
