// app.js - connects MoneyManager and Transaction to the DOM

import MoneyManager from "./MoneyManager.js";

const manager = new MoneyManager();

// sub-category options
const subCategories = {
    Income: ["Salary", "Allowance", "Bonus", "Petty Cash"],
    Expense: ["Rent", "Food", "Shopping", "Entertainment"]
};

// DOM elements
const openFormBtn = document.getElementById("openFormBtn");
const closeFormBtn = document.getElementById("closeFormBtn");
const cancelFormBtn = document.getElementById("cancelFormBtn");
const modalOverlay = document.getElementById("modalOverlay");
const transactionForm = document.getElementById("transactionForm");
const modalTitle = document.getElementById("modalTitle");
const editIdInput = document.getElementById("editId");

const amountInput = document.getElementById("amount");
const dateInput = document.getElementById("date");
const subCategorySelect = document.getElementById("subCategory");
const descriptionInput = document.getElementById("description");

const totalIncomeEl = document.getElementById("totalIncome");
const totalExpenseEl = document.getElementById("totalExpense");
const netBalanceEl = document.getElementById("netBalance");

const tableBody = document.getElementById("transactionTableBody");
const emptyState = document.getElementById("emptyState");

const filterCategory = document.getElementById("filterCategory");
const filterSubCategory = document.getElementById("filterSubCategory");
const filterDateFrom = document.getElementById("filterDateFrom");
const filterDateTo = document.getElementById("filterDateTo");
const sortBy = document.getElementById("sortBy");
const clearFiltersBtn = document.getElementById("clearFiltersBtn");

const deleteOverlay = document.getElementById("deleteOverlay");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");
const cancelDeleteBtn = document.getElementById("cancelDeleteBtn");

// track which transaction is being deleted
let deleteTargetId = null;

// ── open / close modal ──

openFormBtn.addEventListener("click", () => {
    resetForm();
    modalTitle.textContent = "Add Transaction";
    modalOverlay.classList.remove("hidden");
    dateInput.value = new Date().toISOString().split("T")[0];
});

closeFormBtn.addEventListener("click", closeModal);
cancelFormBtn.addEventListener("click", closeModal);

function closeModal() {
    modalOverlay.classList.add("hidden");
    resetForm();
}

// ── update sub-category dropdown when category changes ──

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

// ── form validation ──

function validateForm() {
    let isValid = true;

    // clear previous errors
    document.getElementById("amountError").textContent = "";
    document.getElementById("dateError").textContent = "";
    document.getElementById("categoryError").textContent = "";
    document.getElementById("subCategoryError").textContent = "";

    amountInput.classList.remove("input-error");
    dateInput.classList.remove("input-error");
    subCategorySelect.classList.remove("input-error");

    // amount check
    if (!amountInput.value || parseFloat(amountInput.value) <= 0) {
        document.getElementById("amountError").textContent = "Amount must be a positive number.";
        amountInput.classList.add("input-error");
        isValid = false;
    }

    // date check
    const today = new Date().toISOString().split("T")[0];
    if (!dateInput.value) {
        document.getElementById("dateError").textContent = "Date is required.";
        dateInput.classList.add("input-error");
        isValid = false;
    } else if (dateInput.value > today) {
        document.getElementById("dateError").textContent = "Date cannot be in the future.";
        dateInput.classList.add("input-error");
        isValid = false;
    }

    // category check
    const selectedCategory = document.querySelector("input[name='category']:checked");
    if (!selectedCategory) {
        document.getElementById("categoryError").textContent = "Please select a category.";
        isValid = false;
    }

    // sub-category check
    if (!subCategorySelect.value) {
        document.getElementById("subCategoryError").textContent = "Please select a sub-category.";
        subCategorySelect.classList.add("input-error");
        isValid = false;
    }

    return isValid;
}

// ── form submit (add or edit) ──

transactionForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const amount = parseFloat(amountInput.value);
    const date = dateInput.value;
    const category = document.querySelector("input[name='category']:checked").value;
    const subCategory = subCategorySelect.value;
    const description = descriptionInput.value.trim();
    const editId = editIdInput.value;

    try {
        if (editId) {
            manager.updateTransaction(parseInt(editId), amount, date, category, subCategory, description);
        } else {
            manager.addTransaction(amount, date, category, subCategory, description);
        }
        closeModal();
        renderAll();
    } catch (err) {
        console.error("Something went wrong:", err);
    }
});

// ── edit button click ──

function handleEdit(id) {
    const t = manager.getTransaction(id);
    if (!t) return;

    modalTitle.textContent = "Edit Transaction";
    editIdInput.value = t.id;
    amountInput.value = t.amount;
    dateInput.value = t.date;

    document.querySelectorAll("input[name='category']").forEach(radio => {
        radio.checked = radio.value === t.category;
    });

    updateSubCategories(t.category);
    subCategorySelect.value = t.subCategory;
    descriptionInput.value = t.description;

    modalOverlay.classList.remove("hidden");
}

// ── delete button click ──

function handleDelete(id) {
    deleteTargetId = id;
    deleteOverlay.classList.remove("hidden");
}

confirmDeleteBtn.addEventListener("click", () => {
    if (deleteTargetId !== null) {
        manager.deleteTransaction(deleteTargetId);
        deleteTargetId = null;
        deleteOverlay.classList.add("hidden");
        renderAll();
    }
});

cancelDeleteBtn.addEventListener("click", () => {
    deleteTargetId = null;
    deleteOverlay.classList.add("hidden");
});

// ── render table ──

function renderTable() {
    const filters = {
        category: filterCategory.value,
        subCategory: filterSubCategory.value,
        dateFrom: filterDateFrom.value,
        dateTo: filterDateTo.value,
        sortBy: sortBy.value
    };

    const transactions = manager.getTransactions(filters);
    tableBody.innerHTML = "";

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

    tableBody.querySelectorAll(".edit-btn").forEach(btn => {
        btn.addEventListener("click", () => handleEdit(parseInt(btn.dataset.id)));
    });

    tableBody.querySelectorAll(".delete-btn").forEach(btn => {
        btn.addEventListener("click", () => handleDelete(parseInt(btn.dataset.id)));
    });
}

// ── render summary cards ──

function renderSummary() {
    totalIncomeEl.textContent = "₹ " + manager.getTotalIncome().toFixed(2);
    totalExpenseEl.textContent = "₹ " + manager.getTotalExpense().toFixed(2);

    const balance = manager.getNetBalance();
    netBalanceEl.textContent = "₹ " + balance.toFixed(2);

    // red if negative balance
    netBalanceEl.style.color = balance >= 0 ? "#838CE5" : "#e05a5a";
}

// ── render everything ──

function renderAll() {
    renderSummary();
    renderTable();
}

// ── reset form ──

function resetForm() {
    transactionForm.reset();
    editIdInput.value = "";
    subCategorySelect.innerHTML = '<option value="">-- select category first --</option>';

    ["amountError", "dateError", "categoryError", "subCategoryError"].forEach(id => {
        document.getElementById(id).textContent = "";
    });

    amountInput.classList.remove("input-error");
    dateInput.classList.remove("input-error");
    subCategorySelect.classList.remove("input-error");
}

// ── filter/sort listeners ──

filterCategory.addEventListener("change", () => {
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
    filterDateTo.value = "";
    sortBy.value = "";
    renderTable();
});

// ── initial render on page load ──
renderAll();