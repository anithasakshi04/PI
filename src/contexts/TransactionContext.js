// src/contexts/TransactionsContext.js
import React, { createContext, useState, useEffect } from "react";

// Create the context
export const TransactionsContext = createContext();

// Provider component
export function TransactionsProvider({ children }) {
  const [transactions, setTransactions] = useState([]);

  // Load stored transactions from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("transactions");
    if (stored) setTransactions(JSON.parse(stored));
  }, []);

  // Save any transaction changes to localStorage for persistence
  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  // Add a new transaction
  const addTransaction = (txn) => {
    setTransactions((prev) => [txn, ...prev]);
  };

  // Approve a transaction by ID
  const approveTransaction = (txnId) => {
    setTransactions((prev) =>
      prev.map((txn) =>
        txn.id === txnId ? { ...txn, status: "approved" } : txn
      )
    );
  };

  return (
    <TransactionsContext.Provider
      value={{ transactions, addTransaction, approveTransaction }}
    >
      {children}
    </TransactionsContext.Provider>
  );
}
