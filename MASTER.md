# MASTER.md - Quick Modification Guide

This document provides instant instructions for tweaking the **Mood Sphere** app components without breaking core functionality.

## 1. Component Sizes & Layout
- **Main Dashboard**: Controlled in [Index.tsx](file:///e:/Code%20projects/github%20projects/mood-sphere-report/src/pages/Index.tsx). The dashboard uses a tabbed navigation system.
- **Submit Daily Log Button**: Large primary action button with a purple gradient and shimmer effect. Styling is in [Index.tsx](file:///e:/Code%20projects/github%20projects/mood-sphere-report/src/pages/Index.tsx) using Tailwind and shimmer utility in [index.css](file:///e:/Code%20projects/github%20projects/mood-sphere-report/src/index.css).
- **Medication Tracker**: [MedicationTracker.tsx](file:///e:/Code%20projects/github%20projects/mood-sphere-report/src/components/MedicationTracker.tsx). Displays prescriptions and a logging button.

## 2. Colors & Visual Identity
Styles are managed in [tailwind.config.ts](file:///e:/Code%20projects/github%20projects/mood-sphere-report/tailwind.config.ts).
- **Primary Purple**: `#8B5CF6`.
- **Aesthetic**: Modern glassmorphism using `glass-card` and `backdrop-blur`.
- **Favicon**: Custom SVG mind-sphere icon in `public/favicon.svg`.

## 3. Security & Privacy (Dr. Umme Ammaara)
- **Header Badge**: A security shield icon next to the title in [Index.tsx](file:///e:/Code%20projects/github%20projects/mood-sphere-report/src/pages/Index.tsx).
- **Text**: Explicitly states data is only accessible to **Dr. Umme Ammaara**. This text is managed within the `TooltipContent` in the header.

## 4. UI Text & Questionnaire
- **Questions**: Modify `moodQuestions` in [MoodQuestionnaire.tsx](file:///e:/Code%20projects/github%20projects/mood-sphere-report/src/components/MoodQuestionnaire.tsx).
- **Medication Text**: Update the "No Medications Prescribed" fallback in [MedicationTracker.tsx](file:///e:/Code%20projects/github%20projects/mood-sphere-report/src/components/MedicationTracker.tsx).

## 5. API Actions & Synchronization
Backend logic in [api/mood-sync.ts](file:///e:/Code%20projects/github%20projects/mood-sphere-report/api/mood-sync.ts):
- `action=fetch_prescriptions`: Fetches active prescriptions for a user.
- `action=save_med_log`: Records medication intake.
- `action=admin_data`: Aggregates all user metrics, including medication adherence.

## 6. Admin Triage & Filters
- **Diagnostic Filters**: Implemented in [AdminDashboard.tsx](file:///e:/Code%20projects/github%20projects/mood-sphere-report/src/components/AdminDashboard.tsx).
- **High-Yield Patterns**: Logic for **Burnout Risk**, **Social Isolation**, and **Slippage** is defined in the `getUserStats` helper function.
- **Medication Filter**: Toggles visibility of users with active `prescriptions`.

## 7. .env & Google Sheets
- **GOOGLE_SHEET_ID**: Main database ID.
- **New Workspace Tabs**: Ensure `MedicationPrescriptions` and `MedicationLogs` tabs exist (see [integration guide](file:///e:/Code%20projects/github%20projects/mood-sphere-report/GOOGLE_SHEETS_INTEGRATION.md)).
