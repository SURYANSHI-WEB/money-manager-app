// validation.js

// checks if a date is in the future
export function isFutureDate(dateString) {
    const today = new Date().toISOString().split("T")[0];
    return dateString > today;
}

// checks all form fields and returns any errors
export function validateTransactionForm(amount, date, category, subCategory) {
    const errors = {};

    if (!amount || parseFloat(amount) <= 0) {
        errors.amount = "Amount must be a positive number.";
    }

    if (!date) {
        errors.date = "Date is required.";
    } else if (isFutureDate(date)) {
        errors.date = "Date cannot be in the future.";
    }

    if (!category) {
        errors.category = "Please select a category.";
    }

    if (!subCategory) {
        errors.subCategory = "Please select a sub-category.";
    }

    // if the errors object is empty, the form is valid!
    return {
        isValid: Object.keys(errors).length === 0,
        errors: errors
    };
}