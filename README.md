# Mood Sphere

**Mood Sphere** is a premium, clinical-grade emotional health tracking and diagnostic platform. It empowers users to manage their mental well-being through advanced journaling, CBT tools, and medication tracking, while providing healthcare professionals with a sophisticated triage and oversight dashboard.

## ✨ Clinical Features

- **Multi-Axial Mood Tracking**: 10-point scale across 5 dimensions (Overall, Stress, Social, Energy, Satisfaction) with real-time longitudinal analysis.
- **CBT Toolkit**: Implemented "Thought Records" for structured cognitive-behavioral therapy exercises.
- **Emotional Journaling**: Free-form journaling for deep qualitative reflection and narrative therapy.
- **Medication Management**: Personalized prescription tracking with one-tap adherence logging.
- **Healthcare Triage**: Advanced Admin Dashboard for doctors to identify burnout risks, social isolation, and therapeutic gaps.
- **End-to-End Security**: Clinical data is private and restricted to authorized consulting psychiatrists (e.g., Dr. Umme Ammaara).

## 🚀 Technical Stack

- **Frontend**: React 18 + TypeScript + Next.js (Pages Router)
- **Styling**: Tailwind CSS + Shadcn UI (Aesthetic: Modern Glassmorphism)
- **Database**: Google Sheets (via Google Spreadsheet API)
- **Backend**: Vercel Serverless Functions (Secure API Bridge)
- **Authentication**: Role-based access control (RBAC) with secure session management.

## 🛠️ Getting Started

1.  **Backend Setup**: Follow the [Google Sheets Integration Guide](./GOOGLE_SHEETS_INTEGRATION.md) to set up your service account and database schema.
2.  **Environment Variables**: Configure your Vercel/Local env with `GOOGLE_SHEET_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL`, and `GOOGLE_PRIVATE_KEY`.
3.  **Local Development**:
    ```bash
    npm i
    vercel dev # Runs both frontend and API bridge
    ```

## 📖 Key Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md): Technical data flow and security model.
- [MASTER.md](./MASTER.md): Reference guide for UI tweaks and clinical parameters.
- [GOOGLE_SHEETS_INTEGRATION.md](./GOOGLE_SHEETS_INTEGRATION.md): Schema and secure backend setup.

## 🔒 Security Audit
This application uses a protected server-side bridge. All sensitive credentials are kept on Vercel's secure environment and are never exposed to the client-side, ensuring full HIPPA-aligned logic and data privacy.
