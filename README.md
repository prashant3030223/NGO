# 🛡️ RescueMatch AI
**Smart Resource Allocation – AI-powered Volunteer Coordination System**

RescueMatch AI is a production-quality hackathon project designed to convert unstructured community data into actionable insights and intelligently match volunteers to urgent needs in real-time.

---

## 🚀 Features

- **AI-Powered Data Ingestion**: Upload reports (PDF/Images) or text to extract needs using OpenAI & Tesseract OCR.
- **Smart Prioritization**: Urgency scoring based on NLP analysis.
- **Intelligent Matching**: Heuristic-based algorithm matching volunteers by skill, distance, and availability.
- **Real-Time Dashboard**: Interactive dark-mode map with live incident heatmaps and volunteer tracking.
- **Dynamic Simulation**: Live updates of incoming data and assignments.

---

## 🛠️ Tech Stack

- **Frontend**: React.js, Tailwind CSS, Framer Motion, Leaflet Maps
- **Backend**: Node.js (Express), Multer (File Handling)
- **AI/ML**: OpenAI API (GPT-3.5), Tesseract.js (OCR), PDF-Parse
- **Utilities**: Lucide Icons, Axios, CLSX

---

## ⚙️ Setup Instructions

### 1. Prerequisites
- Node.js (v18+)
- Firebase Project (Firestore enabled)
- OpenAI API Key

### 2. Local Development
You can now run both client and server from the root directory:
```bash
npm run install-all
npm run dev
```

### 3. Production Deployment
This project is configured to be deployed as a single unit where the Node.js server serves the React frontend.

1. **Build the frontend**:
   ```bash
   npm run build
   ```
2. **Configure Environment Variables**:
   - Copy `server/.env.example` to `server/.env` and fill in the values.
   - Copy `client/.env.example` to `client/.env` and fill in the values.
3. **Start the server**:
   ```bash
   npm start
   ```

The server will automatically serve the built frontend from `client/dist`.

---

## 🌐 Deployment Platforms

- **Render / Heroku / DigitalOcean**: Use the root `package.json`. The `build` script will install everything and build the client. The `start` script will launch the production server.
- **Vercel / Netlify**: These are typically for frontend-only. For this MERN stack, a platform that supports Node.js (like Render or Railway) is recommended.


---

## 📊 Demo Flow

1. **Dashboard**: Observe the live map with pre-filled crisis zones and volunteer locations.
2. **Ingest Data**: Navigate to "Ingest Data", upload `data/sample_report.txt` or type a report.
3. **AI Analysis**: Watch as the AI parses the report, assigns an urgency score, and adds it to the dashboard.
4. **Auto-Assign**: Click the "Auto-Assign Volunteers" button to trigger the matching engine.
5. **Real-time Allocation**: See volunteers instantly matched to the highest-priority needs in the assignment panel.

---

## 🏗️ Project Structure

- `client/`: React frontend with Tailwind & Leaflet.
- `server/`: Express backend with AI & OCR services.
- `data/`: Sample datasets for testing.
- `uploads/`: Temporary storage for processed reports.

---

Developed for the Smart Resource Allocation Challenge.
