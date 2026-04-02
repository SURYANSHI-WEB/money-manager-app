// this class manages all transactions - handles CRUD operations and local storage

import Transaction from "./Transaction.js";

class MoneyManager {
    constructor() {
        // load any saved transactions when the app starts
        this.transactions = this.loadFromStorage();
    }

    // read from local storage and rebuild Transaction objects
    loadFromStorage() {
        const data = localStorage.getItem("transactions");
        if (data) {
            const parsed = JSON.parse(data);
            // JSON.parse gives plain objects, so we map them back into Transaction instances
            return parsed.map(t => new Transaction(t.id, t.amount, t.date, t.category, t.subCategory, t.description));
        }
        return [];
    }

    // save the current transactions array to local storage as JSON
    saveToStorage() {
        localStorage.setItem("transactions", JSON.stringify(this.transactions));
    }

    // create a new transaction and add it to the array
    addTransaction(amount, date, category, subCategory, description) {
        const id = Date.now(); // using timestamp as a simple unique id
        const newTransaction = new Transaction(id, amount, date, category, subCategory, description);
        this.transactions.push(newTransaction);
        this.saveToStorage();
    }

    // find a transaction by id and replace it with updated values
    updateTransaction(id, amount, date, category, subCategory, description) {
        const index = this.transactions.findIndex(t => t.id === id);
        if (index !== -1) {
            this.transactions[index] = new Transaction(id, amount, date, category, subCategory, description);
            this.saveToStorage();
        }
    }

    // remove a transaction from the array by id
    deleteTransaction(id) {
        this.transactions = this.transactions.filter(t => t.id !== id);
        this.saveToStorage();
    }

    // get a single transaction by id (used to pre-fill the edit form)
    getTransaction(id) {
        return this.transactions.find(t => t.id === id);
    }

    // return filtered and sorted list of transactions
    getTransactions(filters = {}) {
        let result = [...this.transactions];

        // apply category filter
        if (filters.category) {
            result = result.filter(t => t.category === filters.category);
        }

        // apply sub-category filter
        if (filters.subCategory) {
            result = result.filter(t => t.subCategory === filters.subCategory);
        }

        // apply date range filter
        if (filters.dateFrom) {
            result = result.filter(t => t.date >= filters.dateFrom);
        }
        if (filters.dateTo) {
            result = result.filter(t => t.date <= filters.dateTo);
        }

        // apply sorting
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

    // add up all income transactions
    getTotalIncome() {
        return this.transactions
            .filter(t => t.category === "Income")
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    }

    // add up all expense transactions
    getTotalExpense() {
        return this.transactions
            .filter(t => t.category === "Expense")
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
    }

    // net balance = total income - total expenses
    getNetBalance() {
        return this.getTotalIncome() - this.getTotalExpense();
    }
}

export default MoneyManager;
