# StatusRing Store

A modern e-commerce platform for dental & medical education posters with Google Sheets data integration, WhatsApp checkout, and Razorpay payment gateway.

## Features

- **Google Sheets Integration**: Products automatically synced from Google Sheets
- **Shopping Cart**: Add products to cart with quantity management
- **WhatsApp Checkout**: Send cart details via WhatsApp for order confirmation
- **Razorpay Payment**: Secure payment processing
- **Responsive Design**: Mobile-friendly interface
- **Product Categories**: Browse by category
- **Product Images**: Thumbnail and detailed images
- **Multiple Colors**: Product color selection

## Live Store

https://jioposters-cloud.github.io/statusring-store/

## Spreadsheet Data Source

https://docs.google.com/spreadsheets/d/1PFSwnII1Z-Fd9-QXv3R0fZJJnGw3-rECcq8xXz-ik4s

## Technology Stack

- HTML5
- CSS3
- JavaScript (Vanilla)
- Google Sheets API
- Razorpay API
- WhatsApp Business API

## Setup Instructions

1. Clone the repository
2. Update the Google Sheets ID in `js/store.js`
3. Configure Razorpay credentials
4. Update WhatsApp Business phone number
5. Deploy to GitHub Pages

## Project Structure

```
statusring-store/
├── index.html
├── css/
│   ├── style.css
│   └── responsive.css
├── js/
│   ├── store.js (Google Sheets integration)
│   ├── cart.js (Cart functionality)
│   └── checkout.js (WhatsApp & Razorpay)
├── data/
│   └── products.json
└── README.md
```

## License

MIT License
