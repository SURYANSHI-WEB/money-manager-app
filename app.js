// this file connects MoneyManager to the DOM - handles all UI interactions

import MoneyManager from "./MoneyManager.js";
import { isFutureDate, validateTransactionForm } from "./validation.js";
import { runTests } from "./tests.js";

const manager = new MoneyManager();

// available sub-categories for each category type
const subCategories = {
    Income: ["Salary", "Allowance", "Bonus", "Petty Cash"],
    Expense: ["Rent", "Food", "Shopping", "Entertainment"]
};

// ── grab all needed DOM elements ──

const openFormBtn     = document.getElementById("openFormBtn");
const closeFormBtn    = document.getElementById("closeFormBtn");
const cancelFormBtn   = document.getElementById("cancelFormBtn");
const modalOverlay    = document.getElementById("modalOverlay");
const transactionForm = document.getElementById("transactionForm");
const modalTitle      = document.getElementById("modalTitle");
const editIdInput     = document.getElementById("editId");

const amountInput       = document.getElementById("amount");
const dateInput         = document.getElementById("date");
const subCategorySelect = document.getElementById("subCategory");
const descriptionInput  = document.getElementById("description");

const totalIncomeEl  = document.getElementById("totalIncome");
const totalExpenseEl = document.getElementById("totalExpense");
const netBalanceEl   = document.getElementById("netBalance");

const tableBody  = document.getElementById("transactionTableBody");
const emptyState = document.getElementById("emptyState");

const filterCategory    = document.getElementById("filterCategory");
const filterSubCategory = document.getElementById("filterSubCategory");
const filterDateFrom    = document.getElementById("filterDateFrom");
const filterDateTo      = document.getElementById("filterDateTo");
const sortBy            = document.getElementById("sortBy");
const clearFiltersBtn   = document.getElementById("clearFiltersBtn");

const deleteOverlay    = document.getElementById("deleteOverlay");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const cancelDeleteBtn  = document.getElementById("cancelDeleteBtn");
const exportCsvBtn     = document.getElementById("exportCsvBtn");

// tracking variables for state
let deleteTargetId = null; // keeps track of which transaction to delete
let lastFocusedElement;    // remembers what to focus when modal closes
let expenseChart = null;   // holds the chart object

// ── accessibility: focus trapping for modals ──

function trapFocus(modalElement) {
    const focusableElements = modalElement.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    modalElement.addEventListener('keydown', function(e) {
        const isTabPressed = e.key === 'Tab' || e.keyCode === 9;
        if (!isTabPressed) return;

        if (e.shiftKey) { // shift + tab
            if (document.activeElement === firstElement) {
                lastElement.focus();
                e.preventDefault();
            }
        } else { // just tab
            if (document.activeElement === lastElement) {
                firstElement.focus();
                e.preventDefault();
            }
        }
    });
}

// apply focus trap to both modals
trapFocus(document.querySelector('#modalOverlay .modal'));
trapFocus(document.querySelector('#deleteOverlay .small-modal'));

// ── modal open / close ──

openFormBtn.addEventListener("click", () => {
    lastFocusedElement = document.activeElement; // remember the button clicked
    resetForm();
    modalTitle.textContent = "Add Transaction";
    modalOverlay.classList.remove("hidden");
    // auto-fill today's date
    dateInput.value = new Date().toISOString().split("T")[0];
    setTimeout(() => amountInput.focus(), 10); // set focus to first input
});

function closeModal() {
    modalOverlay.classList.add("hidden");
    resetForm();
    // return focus back to the page so keyboard users don't get lost
    if (lastFocusedElement) lastFocusedElement.focus();
}

closeFormBtn.addEventListener("click", closeModal);
cancelFormBtn.addEventListener("click", closeModal);

// close modal when pressing escape key
document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        closeModal();
        deleteOverlay.classList.add("hidden");
    }
});

// ── reset form to empty state ──

function resetForm() {
    transactionForm.reset();
    editIdInput.value = "";
    subCategorySelect.innerHTML = '<option value="">-- select category first --</option>';

    // clear all error messages and red borders
    ["amountError", "dateError", "categoryError", "subCategoryError"].forEach(id => {
        document.getElementById(id).textContent = "";
    });

    amountInput.classList.remove("input-error");
    dateInput.classList.remove("input-error");
    subCategorySelect.classList.remove("input-error");
}

// ── sub-category dropdown logic ──

// update sub-category options whenever category radio changes
document.querySelectorAll("input[name='category']").forEach(radio => {
    radio.addEventListener("change", () => {
        updateSubCategories(radio.value);
    });
});

function updateSubCategories(category) {
    subCategorySelect.innerHTML = '<option value="">-- select --</option>';
    if (subCategories[category]) {
        subCategories[category].forEach(sub => {
            const option = document.createElement("option");
            option.value = sub;
            option.textContent = sub;
            subCategorySelect.appendChild(option);
        });
    }
}

// ── live date validation ──

dateInput.addEventListener("change", () => {
    const dateError = document.getElementById("dateError");
    if (isFutureDate(dateInput.value)) {
        dateError.textContent = "Date cannot be in the future.";
        dateInput.classList.add("input-error");
    } else {
        dateError.textContent = "";
        dateInput.classList.remove("input-error");
    }
});

// ── form validation on submit ──

function validateForm() {
    // clear all previous error messages and red borders first
    ["amountError", "dateError", "categoryError", "subCategoryError"].forEach(id => {
        document.getElementById(id).textContent = "";
    });
    amountInput.classList.remove("input-error");
    dateInput.classList.remove("input-error");
    subCategorySelect.classList.remove("input-error");

    // grab current values
    const amount = amountInput.value;
    const date = dateInput.value;
    const categoryEl = document.querySelector("input[name='category']:checked");
    const category = categoryEl ? categoryEl.value : null;
    const subCategory = subCategorySelect.value;

    // run our new modular validation
    const result = validateTransactionForm(amount, date, category, subCategory);

    // if it fails, show the specific errors
    if (!result.isValid) {
        if (result.errors.amount) {
            document.getElementById("amountError").textContent = result.errors.amount;
            amountInput.classList.add("input-error");
        }
        if (result.errors.date) {
            document.getElementById("dateError").textContent = result.errors.date;
            dateInput.classList.add("input-error");
        }
        if (result.errors.category) {
            document.getElementById("categoryError").textContent = result.errors.category;
        }
        if (result.errors.subCategory) {
            document.getElementById("subCategoryError").textContent = result.errors.subCategory;
            subCategorySelect.classList.add("input-error");
        }
    }

    return result.isValid;
}

// ── form submit (handles both add and edit) ──

transactionForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // stop if validation fails
    if (!validateForm()) return;

    const amount      = parseFloat(amountInput.value);
    const date        = dateInput.value;
    const category    = document.querySelector("input[name='category']:checked").value;
    const subCategory = subCategorySelect.value;
    const description = descriptionInput.value.trim();
    const editId      = editIdInput.value;

    try {
        if (editId) {
            // editId is set means we're updating an existing transaction
            manager.updateTransaction(parseInt(editId), amount, date, category, subCategory, description);
            showToast("Transaction updated!");
        } else {
            // no editId means we're adding a new one
            manager.addTransaction(amount, date, category, subCategory, description);
            showToast("Transaction added!");
        }
        closeModal();
        renderAll();
    } catch (err) {
        console.error("Something went wrong:", err);
    }
});

// ── edit transaction ──

function handleEdit(id) {
    const t = manager.getTransaction(id);
    if (!t) return;

    // switch modal to edit mode and pre-fill the form
    modalTitle.textContent = "Edit Transaction";
    editIdInput.value  = t.id;
    amountInput.value  = t.amount;
    dateInput.value    = t.date;

    // check the correct radio button
    document.querySelectorAll("input[name='category']").forEach(radio => {
        radio.checked = radio.value === t.category;
    });

    updateSubCategories(t.category);
    subCategorySelect.value = t.subCategory;
    descriptionInput.value  = t.description;

    lastFocusedElement = document.activeElement;
    modalOverlay.classList.remove("hidden");
    setTimeout(() => amountInput.focus(), 10);
}

// ── delete transaction ──

function handleDelete(id) {
    lastFocusedElement = document.activeElement;
    deleteTargetId = id;
    deleteOverlay.classList.remove("hidden");
    setTimeout(() => cancelDeleteBtn.focus(), 10);
}

confirmDeleteBtn.addEventListener("click", () => {
    if (deleteTargetId !== null) {
        manager.deleteTransaction(deleteTargetId);
        deleteTargetId = null;
        deleteOverlay.classList.add("hidden");
        showToast("Transaction deleted.");
        renderAll();
        if (lastFocusedElement) lastFocusedElement.focus();
    }
});

cancelDeleteBtn.addEventListener("click", () => {
    deleteTargetId = null;
    deleteOverlay.classList.add("hidden");
    if (lastFocusedElement) lastFocusedElement.focus();
});

// ── toast notification ──

// shows a small message at the bottom of the screen for 2.5 seconds
function showToast(message) {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.classList.remove("hidden");
    toast.classList.add("show");
    setTimeout(() => {
        toast.classList.remove("show");
        toast.classList.add("hidden");
    }, 2500);
}

// ── export to csv ──

exportCsvBtn.addEventListener("click", () => {
    // get currently filtered transactions
    const filters = {
        category: filterCategory.value,
        subCategory: filterSubCategory.value,
        dateFrom: filterDateFrom.value,
        dateTo: filterDateTo.value,
        sortBy: sortBy.value
    };
    const transactions = manager.getTransactions(filters);

    if (transactions.length === 0) {
        showToast("No data to export!");
        return;
    }

    // create the csv header row
    let csvContent = "Date,Category,Sub-Category,Description,Amount\n";

    // add each transaction as a new row
    transactions.forEach(t => {
        // wrapping description in quotes in case it has commas
        const safeDescription = t.description ? `"${t.description.replace(/"/g, '""')}"` : "";
        csvContent += `${t.date},${t.category},${t.subCategory},${safeDescription},${t.amount}\n`;
    });

    // create a fake file and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", "money_manager_export.csv");
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast("Downloaded CSV file!");
});

// ── filter and sort listeners ──

filterCategory.addEventListener("change", () => {
    // update sub-category filter options to match selected category
    filterSubCategory.innerHTML = '<option value="">All Sub-Categories</option>';
    if (filterCategory.value && subCategories[filterCategory.value]) {
        subCategories[filterCategory.value].forEach(sub => {
            const option = document.createElement("option");
            option.value = sub;
            option.textContent = sub;
            filterSubCategory.appendChild(option);
        });
    }
    renderTable();
});

filterSubCategory.addEventListener("change", renderTable);
filterDateFrom.addEventListener("change", renderTable);
filterDateTo.addEventListener("change", renderTable);
sortBy.addEventListener("change", renderTable);

clearFiltersBtn.addEventListener("click", () => {
    filterCategory.value = "";
    filterSubCategory.innerHTML = '<option value="">All Sub-Categories</option>';
    filterDateFrom.value = "";
    filterDateTo.value   = "";
    sortBy.value         = "";
    renderTable();
});

// ── rendering functions ──

function renderTable() {
    const filters = {
        category:    filterCategory.value,
        subCategory: filterSubCategory.value,
        dateFrom:    filterDateFrom.value,
        dateTo:      filterDateTo.value,
        sortBy:      sortBy.value
    };

    const transactions = manager.getTransactions(filters);
    tableBody.innerHTML = "";

    // show empty state message if no transactions match
    if (transactions.length === 0) {
        emptyState.style.display = "block";
        return;
    }

    emptyState.style.display = "none";

    transactions.forEach(t => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${t.date}</td>
            <td>${t.category}</td>
            <td>${t.subCategory}</td>
            <td>${t.description || "-"}</td>
            <td class="${t.category === "Income" ? "income-amt" : "expense-amt"}">
                ${t.category === "Income" ? "+" : "-"} ₹${parseFloat(t.amount).toFixed(2)}
            </td>
            <td>
                <button class="edit-btn" data-id="${t.id}">Edit</button>
                <button class="delete-btn" data-id="${t.id}">Delete</button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    // attach listeners to edit/delete buttons in each row
    tableBody.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", () => handleEdit(parseInt(btn.dataset.id)));
    });

    tableBody.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", () => handleDelete(parseInt(btn.dataset.id)));
    });
}

function renderSummary() {
    totalIncomeEl.textContent  = "₹ " + manager.getTotalIncome().toFixed(2);
    totalExpenseEl.textContent = "₹ " + manager.getTotalExpense().toFixed(2);

    const balance = manager.getNetBalance();
    netBalanceEl.textContent = "₹ " + balance.toFixed(2);

    // turn balance red if user is spending more than they earn
    netBalanceEl.style.color = balance >= 0 ? "#838CE5" : "#e05a5a";
}

function renderChart() {
    const ctx = document.getElementById('expenseChart').getContext('2d');

    // filter out only expenses
    const expenses = manager.transactions.filter(t => t.category === "Expense");

    // group and sum by sub-category
    const totalsByCategory = {};
    expenses.forEach(t => {
        if (!totalsByCategory[t.subCategory]) totalsByCategory[t.subCategory] = 0;
        totalsByCategory[t.subCategory] += parseFloat(t.amount);
    });

    const labels = Object.keys(totalsByCategory);
    const data = Object.values(totalsByCategory);

    // destroy old chart if it exists
    if (expenseChart) expenseChart.destroy();

    // hide container if there are no expenses
    const chartContainer = document.querySelector('.chart-container');
    if (data.length === 0) {
        chartContainer.style.display = 'none';
        return;
    }
    chartContainer.style.display = 'block';

    // draw the new doughnut chart
    expenseChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                data: data,
                backgroundColor: ['#838CE5', '#D6B9FC', '#50207A', '#9880b8'],
                borderColor: '#1a1030',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { position: 'bottom', labels: { color: '#e0d4f8' } },
                title: { display: true, text: 'Expense Breakdown', color: '#D6B9FC', font: { size: 16 } }
            }
        }
    });
}

function renderAll() {
    renderSummary();
    renderTable();
    renderChart();
}

// ── initialization ──

// run the automated tests in the background
runTests();

// load saved data and display it on page start
renderAll();
