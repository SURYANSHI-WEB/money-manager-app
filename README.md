# Money Manager App

A personal finance tracker web app built using HTML, CSS, and JavaScript as part of my Vineyard Capstone Project.

---

## What it does

- Add, edit, and delete income/expense transactions
- View total income, total expenses, and net balance
- Filter transactions by category, sub-category, and date range
- Sort transactions by date or amount
- All data is saved in localStorage so it persists on page refresh

---

## File Structure

```
├── index.html        # main UI structure
├── style.css         # all styling
├── Transaction.js    # Transaction class (OOP)
├── MoneyManager.js   # MoneyManager class - handles all CRUD and localStorage
├── app.js            # DOM manipulation and event handling
└── .gitignore
```

---

## How I built it

### HTML
Structured the app into three main sections — summary cards, filter bar, and transaction table. Two popup modals handle adding/editing and delete confirmation.

### CSS
Used a dark purple color scheme (`#0e0a1a` background, `#50207A`, `#D6B9FC`, `#838CE5` accents). Layout uses CSS Grid for the summary cards and Flexbox for the filter bar. Added a media query for responsiveness on smaller screens.

### JavaScript (OOP + ES6 Modules)

**Transaction.js** — a simple class that represents one transaction with fields: id, amount, date, category, subCategory, description.

**MoneyManager.js** — the main class that manages the transactions array. It handles:
- Loading and saving to localStorage
- CRUD operations (add, update, delete, get)
- Filtering and sorting
- Calculating totals

**app.js** — connects everything to the DOM. Handles all event listeners, form validation, rendering the table and summary cards.

---

## Form Validation

- Amount must be a positive number
- Date cannot be empty or in the future
- Category must be selected (radio button)
- Sub-Category must be selected from dropdown
- Description is optional but limited to 100 characters
- Invalid fields are highlighted with a red border and show an error message

---

## Challenges

- Converting plain JSON objects from localStorage back into proper Transaction class instances
- Making the sub-category dropdown update dynamically based on the selected category
- Handling both add and edit mode in the same form using a hidden input field

---

## Key Learnings

- How OOP helps organize and manage application data cleanly
- How ES6 modules keep code modular and easy to read
- How localStorage works for client-side data persistence
- Importance of form validation for better user experience