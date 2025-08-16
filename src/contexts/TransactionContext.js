import React, { createContext, useState, useEffect } from "react";

// Create context
export const TransactionsContext = createContext();

const dummyTransactions = [
  {
    id: "TXN1001",
    accountNo: "1234567890",
    amount: "+50000",
    method: "NEFT",
    paymentMethod: "NEFT",
    date: "2025-08-15",
    status: "approved",
    batchId: "PAYROLL20250815",
  },
  {
    id: "TXN1002",
    accountNo: "1234567890",
    amount: "-10000",
    method: "RTGS",
    paymentMethod: "RTGS",
    date: "2025-08-16",
    status: "approved",
    batchId: "PAYROLL20250815",
  },
  {
    id: "TXN1003",
    accountNo: "9876543210",
    amount: "+45000",
    method: "IMPS",
    paymentMethod: "IMPS",
    date: "2025-08-15",
    status: "approved",
    batchId: "PAYROLL20250815",
  },
  {
    id: "TXN1004",
    accountNo: "9876543210",
    amount: "-5000",
    method: "NEFT",
    paymentMethod: "NEFT",
    date: "2025-07-20",
    status: "approved",
    batchId: "PAYROLL20250720",
  },
];

export function TransactionsProvider({ children }) {
  const [transactions, setTransactions] = useState([]);

  // Load or seed transactions from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("transactions");
    if (stored) {
      setTransactions(JSON.parse(stored));
    } else {
      // Seed with dummy data if none in localStorage
      setTransactions(dummyTransactions);
      localStorage.setItem("transactions", JSON.stringify(dummyTransactions));
    }
  }, []);

  // Save transactions to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (txn) => {
    setTransactions((prev) => [txn, ...prev]);
  };

  const approveTransaction = (txnId) => {
    setTransactions((prev) =>
      prev.map((txn) => (txn.id === txnId ? { ...txn, status: "approved" } : txn))
    );
  };

  return (
    <TransactionsContext.Provider value={{ transactions, addTransaction, approveTransaction }}>
      {children}
    </TransactionsContext.Provider>
  );
}
