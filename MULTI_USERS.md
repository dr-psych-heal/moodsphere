# Multi-User Support Guide

MoodSphere now supports multiple unique users, each with their own dashboard and encrypted data storage.

## How it Works

1.  **Authentication**: Users enter both a **Username** and a **Password**.
2.  **Verification**: The application checks the `Users` tab in your Google Sheet for matching credentials.
3.  **Data Isolation**: Every mood entry is tagged with the `Username`. When you log in, the app only fetches entries that match your specific username.

## 1. Google Sheets Setup

You must add a second tab to your Google Sheet named **`Users`**.

| Username | Password | Full Name |
| :--- | :--- | :--- |
| john_doe | p@ssword123 | John Doe |
| jane_smith | secret456 | Jane Smith |

> [!IMPORTANT]
> The tab name must be EXACTLY **`Users`** (case-sensitive).

## 2. Updated Data Schema

The main tab (where mood entries go) now requires a **Username** column as the first colum.

| Username | Date | Overall Score | ... (other columns) |
| :--- | :--- | :--- | :--- |
| john_doe | 2024-02-07T... | 8 | ... |

## 3. Adding New Users

To add a user, simply add a new row to the **`Users`** tab in your spreadsheet. They can immediately log in using the credentials you provided.

## 4. Security Notes

*   **Passwords**: Passwords are currently stored in plain text in the spreadsheet for simplicity. If you require hashing, a more complex backend setup is needed.
*   **Privacy**: Users can only see their own data through the UI. However, as the owner of the Google Sheet, you can see all data.
