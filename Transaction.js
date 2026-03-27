// Transaction class - represents a single transaction object

class Transaction {
    constructor(id, amount, date, category, subCategory, description) {
        this.id = id;
        this.amount = amount;
        this.date = date;
        this.category = category;
        this.subCategory = subCategory;
        this.description = description;
    }
}

export default Transaction;
