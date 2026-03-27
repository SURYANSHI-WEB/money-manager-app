// MoneyManager class - handles all CRUD operations and localStorage

import Transaction from "./Transaction.js";

class MoneyManager {
    constructor() {
        this.transactions = this.loadFromStorage();
    }

    // load saved transactions from localStorage
    loadFromStorage() {
        const data = localStorage.getItem("transactions");
        if (data) {
            const parsed = JSON.parse(data);
            // convert plain objects back into Transaction instances
            return parsed.map(t => new Transaction(t.id, t.amount, t.date, t.category, t.subCategory, t.description));
        }
        return [];
    }

    // save current transactions array to localStorage
    saveToStorage() {
        localStorage.setItem("transactions", JSON.stringify(this.transactions));
    }

    // add a new transaction
    addTransaction(amount, date, category, subCategory, description) {
        const id = Date.now();
        const newTransaction = new Transaction(id, amount, date, category, subCategory, description);
        this.transactions.push(newTransaction);
        this.saveToStorage();
    }

    // update an existing transaction by id
    updateTransaction(id, amount, date, category, subCategory, description) {
        const index = this.transactions.findIndex(t => t.id === id);
        if (index !== -1) {
            this.transactions[index] = new Transaction(id, amount, date, category, subCategory, description);
            this.saveToStorage();
        }
    }

    // delete a transaction by id
    deleteTransaction(id) {
        this.transactions = this.transactions.filter(t => t.id !== id);
        this.saveToStorage();
    }

    // get a single transaction by id
    getTransaction(id) {
        return this.transactions.find(t => t.id === id);
    }

    // get all transactions (with optional filter and sort)
    getTransactions(filters = {}) {
        let result = [...this.transactions];

        if (filters.category) {
            result = result.filter(t => t.category === filters.category);
        }

        if (filters.subCategory) {
            result = result.filter(t => t.subCategory === filters.subCategory);
        }

        if (filters.dateFrom) {
            result = result.filter(t => t.date >= filters.dateFrom);
        }

        if (filters.dateTo) {
            result = result.filter(t => t.date <= filters.dateTo);
        }

        if (filters.sortBy === "date-newest") {
            result.sort((a, b) => new Date(b.date) - new Date(a.date));
        } else if (filters.sortBy === "date-oldest") {
            result.sort((a, b) => new Date(a.date) - new Date(b.date));
        } else if (filters.sortBy === "amount-high") {
            result.sort((a, b) => b.amount - a.amount);
        } else if (filters.sortBy === "amount-low") {
            result.sort((a, b) => a.amount - b.amount);
        }

        return result;
    }

    // calculate total income
    getTotalIncome() {
        return this.transactions
            .filter(t => t.category === "Income")
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    }

    // calculate total expenses
    getTotalExpense() {
        return this.transactions
            .filter(t => t.category === "Expense")
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    }

    // calculate net balance
    getNetBalance() {
        return this.getTotalIncome() - this.getTotalExpense();
    }
}

export default MoneyManager;