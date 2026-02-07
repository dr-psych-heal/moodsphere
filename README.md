# MoodSphere

**MoodSphere** is a sophisticated emotional health tracking application that helps users visualize their mood trends, identify triggers, and generate health reports.

## ✨ Key Features

- **Dynamic Mood Tracking**: 10-point scale across 5 dimensions (Overall, Stress, Social, Energy, Satisfaction).
- **Trigger Analysis**: Select from 8 categories of common life stressors and triggers.
- **Trend Visualization**: Real-time graphing of mood history using Recharts.
- **Insights Report**: Generates a downloadable text report for therapists or personal record-keeping.
- **Local-First**: Complete privacy with data stored exclusively in your browser's local storage.
- **Adaptive UI**: Beautiful glassmorphism design with full Dark/Light mode support.

## 🚀 Technical Stack

- **Framework**: React 18 + TypeScript
- **Bundler**: Vite
- **Styling**: Tailwind CSS (with custom purple palette)
- **UI System**: shadcn/ui + Radix UI
- **Visuals**: Recharts & Lucide Icons

## 🛠️ Getting Started

1. **Install Dependencies**:
   ```bash
   npm i
   ```
2. **Development**:
   ```bash
   npm run dev
   ```
3. **Build Configuration**:
   The app uses `localStorage` for persistence, so no backend setup is required.

## 📖 Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md): Detailed technical overview and data flow.
- [MASTER.md](./MASTER.md): Reference guide for modifying UI, components, and constants.

## ⚡ Deployment

Deploy easily to any static hosting provider (Netlify, Vercel, GitHub Pages) using:
```bash
npm run build
```
Then upload the `dist` folder.
