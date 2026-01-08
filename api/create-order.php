  <?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');

require 'vendor/autoload.php';

use Razorpay\API\Api;

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);

$key_id = $_ENV['RAZORPAY_KEY_ID'];
$key_secret = $_ENV['RAZORPAY_KEY_SECRET'];

$api = new Api($key_id, $key_secret);

try {
    $orderData = [
        'amount' => $data['amount'] * 100,
        'currency' => 'INR',
        'receipt' => 'order_' . time()
    ];
    
    $order = $api->order->create($orderData);
    
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'order_id' => $order['id']
    ]);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
