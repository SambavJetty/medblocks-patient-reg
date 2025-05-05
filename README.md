# 🏥 React Patient Registration App

## 🚀 Deployment

Live at: [https://v0-react-patient-registration.vercel.app/](https://v0-react-patient-registration.vercel.app/)

## 📋 Project Description

A frontend-only React application that allows:

1. ✅ Registering new patients.
2. 🔍 Querying patient records using SQL.
3. 💾 Persisting patient data across page refreshes.
4. 🔄 Supporting simultaneous usage in multiple browser tabs.

The application uses **[PGlite](https://github.com/lvce-editor/pglite)**, a WASM-based SQLite-compatible database, entirely in the browser. No backend is required.

## ✨ Features

- Patient Registration Form
- SQL Query Interface
- Data Persistence via IndexedDB using PGlite
- Real-time access across tabs (using shared storage)
- Responsive and modern UI with CSS gradients
- Side-by-side layout for form and query interface

## 🧠 Challenges Faced

- **Integrating PGlite**: Ensuring SQL operations persist in browser storage was tricky due to async initialization.
- **Concurrent Tab Access**: IndexedDB-based storage must sync properly across tabs without data corruption.
- **UI Simplicity vs Modern Look**: Balancing a clean, gradient-based modern UI while keeping code simple for a college-level project.
- **Maintaining Simplicity**: Avoiding overengineering while still using real SQL features inside the browser.

## 🛠️ How to Run Locally

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/patient-registration-app.git
   cd patient-registration-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start

Created with 💙 using React + PGlite
