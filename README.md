# Dish It! 🍽️

A simple, beautiful meal planner application that helps you never wonder what's for dinner again.

## How to Run

This application has been converted to a pure static webpage. It does not require any server, Node.js, Bun, or build tools.

To run the application:
1. Double-click the **[index.html](file:///c:/Users/rafaelhernandez/Documents/GitHub/dish-it/index.html)** file in your file explorer to open it directly in any web browser.
2. Bookmark the page in your browser for easy access!

## Features

- **Create Meal Plan**: Automatically generate a weekly meal plan from your saved meals based on your repeat setting.
- **Manage Meals**: Easily add, edit, or delete meals in your collection.
- **Settings**: Adjust how many days to plan (5, 7, or custom), configure the repeat interval to prevent duplicate meals, and export/import your meal lists as JSON.
- **Data Persistence**: All settings and meals are saved locally in your browser's `localStorage`, meaning your data is retained even when you close the tab.
- **Tailwind CSS integration**: Uses Tailwind CSS v4 loaded directly via Browser CDN (dynamic in-browser compiler) for styling.

## Local Files

- **`index.html`**: The structure of the application.
- **`app.js`**: The compiled vanilla JavaScript containing all logic (routing, storage, meal planner).
