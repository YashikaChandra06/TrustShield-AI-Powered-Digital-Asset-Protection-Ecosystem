# TrustShield AI-Powered Digital Asset Protection Ecosystem

🚀 **Live Deployment:** [https://trustshield-app-749856751403.us-central1.run.app](https://trustshield-app-749856751403.us-central1.run.app)

TrustShield is a full-stack, premium digital asset protection platform designed to securely upload, scan, and encrypt sensitive files. Built with a modern tech stack, it features modular AI security scanning, active asset protection mechanisms, and real-time analytics.

## 🌟 Key Features

- **Secure User Authentication**: Robust JWT-based session management.
- **Multi-Format Asset Management**: Securely upload and manage PDFs, images, code files, and more.
- **Modular AI Security Scanning**: Analyzes uploads and generates detailed Risk, Malware, Copyright, and Privacy scores.
- **Active Asset Protection**: Users can actively "Encrypt" or "Lock" their digital assets.
- **Analytics Dashboard**: Real-time interactive charts visualizing asset security posture and processing status.
- **Audit Logging**: A comprehensive chronological activity log of all user actions to ensure traceability.
- **Premium UI/UX**: A stunning dark-mode interface featuring glassmorphism aesthetics, built with Tailwind CSS.

## 🛠️ Technology Stack

- **Frontend**: React.js, Vite, Tailwind CSS, Recharts, Lucide-React
- **Backend**: Node.js, Express.js
- **Database**: SQLite
- **Deployment**: Docker, Google Cloud Run

## 🚀 Getting Started Locally

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/YashikaChandra06/TrustShield-AI-Powered-Digital-Asset-Protection-Ecosystem.git
   cd TrustShield-AI-Powered-Digital-Asset-Protection-Ecosystem
   ```

2. **Install Backend Dependencies:**
   ```bash
   npm install
   ```

3. **Install Frontend Dependencies:**
   ```bash
   cd client
   npm install
   ```

4. **Environment Variables:**
   Create a `.env` file in the root directory and add your JWT secret:
   ```env
   JWT_SECRET=your_super_secret_key_here
   PORT=3000
   ```

### Running the Application

1. **Start the Backend Server** (from the root directory):
   ```bash
   node src/server.js
   ```

2. **Start the Frontend Development Server** (in a new terminal):
   ```bash
   cd client
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173` to view the application!

## 🐳 Docker Deployment

To build and run the application using Docker:

```bash
docker build -t trustshield-app .
docker run -p 3000:3000 trustshield-app
```