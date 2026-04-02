// this class represents a single transaction entry in the app

class Transaction {
    constructor(id, amount, date, category, subCategory, description) {
        this.id = id;                   // unique id using Date.now()
        this.amount = amount;           // transaction amount
        this.date = date;               // date in YYYY-MM-DD format
        this.category = category;       // "Income" or "Expense"
        this.subCategory = subCategory; // e.g. salary, rent, food
        this.description = description; // optional note
    }
}

export default Transaction;