// utils/accountUtils.js
// Helpers to build dynamic balances and enriched transactions from batch + vendor data

// Robust date parser for "YYYY-MM-DD HH:mm" or "YYYY-MM-DD"
function toDate(d) {
  if (!d) return new Date(0);
  // normalize "YYYY-MM-DD HH:mm" -> "YYYY-MM-DDTHH:mm"
  const normalized = String(d).includes(" ")
    ? String(d).replace(" ", "T")
    : String(d);
  const date = new Date(normalized);
  return isNaN(date.getTime()) ? new Date(0) : date;
}

// Add vendor info if toAccount is a vendorId, and a friendly display for counterparty
export function enrichTransactions(transactions = [], vendorData) {
  const vendors = (vendorData && vendorData.vendors) || [];
  return transactions.map((txn) => {
    const vendor = vendors.find((v) => v.vendorId === txn.toAccount);
    const amountNumber =
      typeof txn.amount === "number"
        ? txn.amount
        : parseFloat(String(txn.amount).replace(/[^\d.-]/g, "")) || 0;

    // Counterparty to show in UI
    let toAccountDisplay = vendor ? vendor.name : txn.toAccount;

    // Mask account-like numbers (10+ digits)
    if (!vendor && /^\d{10,}$/.test(String(txn.toAccount))) {
      const acc = String(txn.toAccount);
      toAccountDisplay = acc.slice(0, 4) + "**" + "**" + acc.slice(-4);
    }

    return {
      ...txn,
      amountNumber,
      vendorName: vendor ? vendor.name : null,
      vendorCategory: vendor ? vendor.category : null,
      toAccountDisplay
    };
  });
}

// Compute a running ledger and current balance.
// Only "Approved" transactions should affect the balance.
export function computeLedger(openingBalance = 0, transactions = []) {
  // Sort chronologically ascending for correct running balances
  const sorted = [...transactions].sort(
    (a, b) => toDate(a.date) - toDate(b.date)
  );

  let running = openingBalance;
  const ledger = sorted.map((txn) => {
    const delta = txn.status === "Approved" ? txn.amountNumber : 0;
    running += delta;
    return {
      ...txn,
      runningBalance: running
    };
  });

  return {
    ledger,
    currentBalance: running
  };
}

// Build a complete accounts array from batch + vendor data
export function buildAccounts(batchData, vendorData) {
  const accounts = (batchData && batchData.accounts) || [];
  return accounts.map((acc) => {
    const enriched = enrichTransactions(acc.transactions || [], vendorData);
    const { ledger, currentBalance } = computeLedger(
      acc.openingBalance || 0,
      enriched
    );

    return {
      ...acc,
      currentBalance,
      // We keep transactions ordered ascending by date; the UI can render as needed
      transactions: ledger
    };
  });
}
