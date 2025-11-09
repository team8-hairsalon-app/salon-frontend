# Salon Frontend

React + Vite + Tailwind + JWT Auth + Stripe Checkout Integration

## Prerequisites
- Node.js 18+
- npm 8+ (comes with Node)
- Git

## Quick Start

### 1) Clone
```bash
git clone <YOUR_REPO_URL> salon-frontend
cd salon-frontend
```

### 2) Install Dependencies
```bash
npm install
```
### 3) Environment Setup
Create a .env file at the repo root:
VITE_API_BASE_URL=http://127.0.0.1:8000/api
VITE_STRIPE_PUBLIC_KEY=pk_test_XXXXXXXXXXXXXXXXXXXXXXXX

### 4) Run in Development Mode
```bash
npm run dev
```
Then open:
http://localhost:5173

### 5) Available Scriptst
```bash
Command	            Description
npm run dev	        Start local dev server (with auto-reload)
npm run build	    Production optimized build
npm run preview	    Preview the built app locally
```
### 6) Project Structure
```bash
salon-frontend/
│
├── src/
│   ├── components/          # UI components (cards, modals, forms)
│   ├── screens/             # Full pages (Gallery, Booking, Login, etc.)
│   ├── lib/                 # API services & auth helpers
│   ├── assets/              # Images / icons / brand elements
│   └── App.jsx              # Main router layout
│
├── public/                  # Static assets
├── .env                     # Environment variables (not in Git)
├── tailwind.config.cjs      # Tailwind configuration
└── package.json             # Project configuration
```
### 7)Key Features
- Mobile-responsive UI (Tailwind)
- User authentication (Login / Sign-Up / Logout)
- Appointment booking with:
   - Date & time selection
   - Available times filtering
   - No double-booking prevention
- Stripe Checkout for Online Payments
- “Pay in Salon” confirmation page option
- Protected routes based on session state
- Toast notifications (react-hot-toast)
- Smooth navigation with react-router
  
### 8) Troubleshooting
```bash
Issue	                         Fix
API requests                     returning 404	Ensure backend is running & base URL in .env is correct
Stripe checkout not appearing	 Confirm VITE_STRIPE_PUBLIC_KEY is correct and dashboard is in test mode
Auth not persisting	             Make sure localStorage domain matches site URL
```
### 9) Deployment
Vercel → React Frontend
