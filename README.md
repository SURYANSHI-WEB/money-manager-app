# Money Manager App

A personal finance tracker web app built using HTML, CSS, and JavaScript as part of my Vineyard Capstone Project.

---

## What it does

- Add, edit, and delete income/expense transactions.
- View total income, total expenses, and net balance.
- Visualize expenses with dynamic, auto-updating doughnut charts (via Chart.js).
- Filter transactions by category, sub-category, and date range.
- Sort transactions by date or amount.
- Export financial data to a downloadable CSV file for external backup.
- All data is saved in localStorage so it persists on page refresh.
- Fully accessible with keyboard navigation (focus trapping) and screen-reader support (ARIA tags).

---

## File Structure

```
├── index.html        # main UI structure (includes Chart.js CDN)
├── style.css         # all styling, responsive design, and animations
├── Transaction.js    # Transaction class (OOP)
├── MoneyManager.js   # MoneyManager class - handles all CRUD, sorting, and localStorage
├── validation.js     # Isolated form validation and date-checking logic
├── tests.js          # Custom automated unit testing suite
├── app.js            # DOM manipulation, event handling, CSV export, and chart rendering
└── .gitignore
```

---

## How I built it

### HTML
Structured the app into three main sections: summary cards, filter bar, and transaction table. I used two popup modals to handle adding/editing and delete confirmation. I also integrated semantic HTML and ARIA attributes (role="dialog", aria-modal="true") to ensure the app is fully accessible to screen readers.

### CSS
Used a dark purple color scheme ( #0e0a1a background, #50207A, #D6B9FC, #838CE5 accents). The layout uses CSS Grid for the summary cards and Flexbox for the filter bar. I also added smooth CSS transitions for the Toast notifications and a media query for responsiveness on smaller screens.

### JavaScript (OOP + ES6 Modules)

**Transaction.js** — A simple class that represents one transaction with fields: id, amount, date, category, subCategory, description.

**MoneyManager.js** — The main class that manages the transactions array. It handles:
- Loading and saving to localStorage
- CRUD operations (add, update, delete, get)
- Filtering and sorting
- Calculating totals

**validation.js** — A dedicated utility module to handle data verification, keeping the main app logic clean.

**tests.js** — A custom testing script that safely backs up user data, runs a suite of automated unit tests on the MoneyManager class to verify CRUD operations, and restores the data.

**app.js** — connects everything to the DOM. Handles all event listeners, form validation, rendering the table and summary cards.

---

## Form Validation

- Amount must be a positive number.
- Date cannot be empty.
- Live feedback: Date inputs are instantly checked to ensure they aren't in the future.
- Category must be selected (radio button).
- Sub-Category must be selected from a dynamically updating dropdown.
- Description is optional but limited to 100 characters.
- Invalid fields are highlighted with a red border and show a specific error message.

---

## Challenges

- Converting plain JSON objects from localStorage back into proper Transaction class instances
- Making the sub-category dropdown update dynamically based on the selected category
- Handling both add and edit mode in the same form using a hidden input field

---

## Key Learnings

- How OOP helps organize and manage application data cleanly.
- How ES6 modules keep code modular, reusable, and easy to read.
- How localStorage works for client-side data persistence.
- The importance of modularizing code (separating validation and testing from DOM manipulation).
- How to integrate third-party libraries (Chart.js) into a vanilla JavaScript project.