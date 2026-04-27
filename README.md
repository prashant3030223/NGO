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
- OpenAI API Key (optional, fallback provided)

### 2. Backend Setup
```bash
cd server
npm install
# Create .env and add your keys
npm start
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```

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
