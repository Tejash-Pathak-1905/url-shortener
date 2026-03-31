# 🕊️ Minimalist URL Shortener

A clean, creamish pastel-themed URL shortener with engagement tracking and private notes. Built for simplicity and speed.

## ✨ Features
- **Instant Shortening**: Convert long URLs into unique, shareable links.
- **Engagement Stats**: Track the total number of clicks for each link.
- **Private Notes**: Add a custom comment to your links for easy tracking in your history.
- **Minimalist Dashboard**: A clean, tabular view of all your shortened links.
- **Soft Aesthetics**: A cozy, cream-colored UI with the modern Outfit typeface.

## 🛠️ Tech Stack
- **Frontend**: React.js with Vanilla CSS
- **Backend**: Node.js & Express
- **Database**: PostgreSQL
- **Utilities**: Nodemon (for auto-restarting the server), Crypto (for short ID generation)

## 🚀 Getting Started

### 1. Prerequisites
- Node.js installed
- PostgreSQL installed and running

### 2. Database Setup
Create a database named `urlshortener` in PostgreSQL and ensure your credentials match the `.env` file in the `/server` folder.

### 3. Installation
Clone the repository and install dependencies for both the server and client:

```bash
# Install Server Dependencies
cd server
npm install

# Install Client Dependencies
cd ../client
npm install
```

### 4. Running the App
For the best experience, run the server using the `dev` script:

```bash
# Start Server (with auto-restart)
cd server
npm run dev

# Start Frontend
cd client
npm start
```

## 👤 Author
**Tejash Pathak**

---
*Created with love and a focus on minimalist design.*
