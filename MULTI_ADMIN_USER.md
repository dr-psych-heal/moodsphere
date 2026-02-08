# MULTI_ADMIN_USER.md - Clinic Setup Guide

This guide explains how to configure **Mood Sphere** for a multi-practitioner clinic, where each Psychiatrist manages only their assigned patients.

## 1. Google Sheets Configuration

### Update the `Users` Tab
Add a new column entitled **`AssociatedPsychiatrist`** as the 5th column in your `Users` tab.

| Username | Password | Full Name | Role | AssociatedPsychiatrist |
| :--- | :--- | :--- | :--- | :--- |
| james_h | pass123 | James Harrison | admin | *(Leave blank for Super Admin)* |
| dr_clark | pass890 | Dr. Clark | admin | |
| patient_a | 1234 | Patient Alice | user | dr_clark |
| patient_b | 5678 | Patient Bob | user | dr_clark |

### Rules for Isolation
1.  **Standard Admin**: Any user with `role=admin` will only see patients where the `AssociatedPsychiatrist` column matches their own `Username`.
2.  **Super Admin**: The username `james_h` is hardcoded as a Super Admin and can see ALL patients across the entire clinic.
3.  **Assignments**: To assign a patient to a doctor, simply type the doctor's **Username** into the patient's `AssociatedPsychiatrist` cell.

## 2. Technical Implementation details

- **Backend Enforcement**: Isolation is handled in the `admin_data` action within [api/mood-sync.ts](file:///e:/Code%20projects/github%20projects/mood-sphere-report/api/mood-sync.ts). It generates an "Authorized Set" of usernames based on the assignment column before fetching any clinical data.
- **Frontend Context**: The dashboard automatically passes the logged-in admin's username to the API to request the correct data slice.

## 3. Deployment Safety
Ensure that your **Vercel Environment Variables** are set correctly. The isolation logic depends on the `username` sent from the client, but it is verified against the secure Google Sheets `Users` tab on the server side.
