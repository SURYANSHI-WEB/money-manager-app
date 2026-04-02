// tests.js
import MoneyManager from "./MoneyManager.js";

export function runTests() {
    console.log("%c--- Running Unit Tests ---", "color: #838CE5; font-weight: bold; font-size: 14px;");

    // backup real user data so we don't accidentally delete it
    const backupData = localStorage.getItem("transactions");
    localStorage.setItem("transactions", "[]"); // start with a blank slate

    // initialize a fresh manager just for testing
    const testManager = new MoneyManager();
    let passed = 0;
    let failed = 0;

    // helper function to print test results to the console
    function assert(condition, testName) {
        if (condition) {
            console.log(`%c✅ ${testName} passed`, "color: #4CAF50;");
            passed++;
        } else {
            console.error(`❌ ${testName} failed`);
            failed++;
        }
    }

    try {
        // ── test 1: add transaction ──
        testManager.addTransaction(5000, "2023-10-01", "Income", "Salary", "Test Income");
        assert(testManager.transactions.length === 1, "Add Transaction: Array length should be 1");
        assert(testManager.getTotalIncome() === 5000, "Add Transaction: Total income should calculate correctly");

        // ── test 2: update transaction ──
        const addedItem = testManager.transactions[0];
        testManager.updateTransaction(addedItem.id, 6000, "2023-10-01", "Income", "Bonus", "Updated Note");
        
        const updatedItem = testManager.getTransaction(addedItem.id);
        assert(updatedItem.amount === 6000, "Update Transaction: Amount should update to 6000");
        assert(updatedItem.subCategory === "Bonus", "Update Transaction: Sub-category should update to Bonus");

        // ── test 3: delete transaction ──
        testManager.deleteTransaction(addedItem.id);
        assert(testManager.transactions.length === 0, "Delete Transaction: Array should be empty after deletion");
        assert(testManager.getNetBalance() === 0, "Delete Transaction: Balance should return to 0");

    } catch (error) {
        console.error("A test crashed the app:", error);
    }

    // restore the real user data back to how it was
    if (backupData) {
        localStorage.setItem("transactions", backupData);
    } else {
        localStorage.removeItem("transactions");
    }

    console.log(`%c--- Tests Finished: ${passed} Passed, ${failed} Failed ---`, "color: #D6B9FC; font-weight: bold;");
}