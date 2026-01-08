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
    $payment = $api->payment->fetch($data['payment_id']);
    
    if ($payment['status'] === 'captured') {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => 'Payment verified',
            'payment_id' => $data['payment_id'],
            'order_id' => $payment['order_id']
        ]);
    } else {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'message' => 'Payment not completed'
        ]);
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
