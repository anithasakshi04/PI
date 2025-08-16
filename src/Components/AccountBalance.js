import React, { useState } from "react";
import { Dropdown, Table, Form, ButtonGroup } from "react-bootstrap";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import accountData from "../Data/accountData.json"; // Import your dummy JSON
// import { TransactionsContext } from "../contexts/TransactionsContext";

function maskAccountNumber(accNo) {
  return (
    accNo.substring(0, 4) +
    "****" +
    "****" +
    accNo.substring(accNo.length - 4)
  );
}

export default function AccountBalance() {
  // const { transactions } = useContext(TransactionsContext);
  const [selected, setSelected] = useState(0);
  const [filterMethod, setFilterMethod] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const allAccounts = accountData.accounts;
  const selectedAccount = allAccounts[selected];

  // Filtering logic
  const filteredTxns = selectedAccount.transactions.filter((txn) => {
    // Method filter
    if (filterMethod !== "All" && txn.method !== filterMethod) {
      return false;
    }
    // Date range filter
    if (fromDate) {
      const txnDate = new Date(txn.date);
      if (txnDate < new Date(fromDate)) {
        return false;
      }
    }
    if (toDate) {
      const txnDate = new Date(txn.date);
      if (txnDate > new Date(toDate)) {
        return false;
      }
    }
    return true;
  });

  // Export as Excel
  const exportExcel = () => {
    const wsData = [
      ["Account Type", selectedAccount.type],
      ["Account Number", selectedAccount.accountNo],
      ["Account Balance", `₹ ${selectedAccount.balance}`],
      [],
      ["Transaction ID", "Date", "Account Number", "Amount", "Method", "Running Balance"],
      ...filteredTxns.map((txn) => [
        txn.id, txn.date, txn.accountNo, txn.amount, txn.method, txn.balance
      ]),
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, "AccountBalance.xlsx");
  };

  // Export as PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Account Type: ${selectedAccount.type}`, 10, 10);
    doc.text(`Account Number: ${selectedAccount.accountNo}`, 10, 18);
    doc.text(`Account Balance: ₹ ${selectedAccount.balance}`, 10, 26);

    const tableColumn = ["Transaction ID", "Date", "Account Number", "Amount", "Method", "Balance"];
    const tableRows = filteredTxns.map((txn) => [
      txn.id, txn.date, txn.accountNo, txn.amount, txn.method, txn.balance
    ]);

    doc.autoTable({
      head: [tableColumn],
      body: tableRows,
      startY: 34,
    });
    doc.save("AccountBalance.pdf");
  };

  // Export as JSON
  const exportJSON = () => {
    const data = {
      accountType: selectedAccount.type,
      accountNumber: selectedAccount.accountNo,
      accountBalance: selectedAccount.balance,
      transactions: filteredTxns,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "AccountBalance.json";
    link.click();
  };

  return (
    <div className="container py-4">
      
      {/* Account Info Box */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
          <div>
            <Form.Label className="fw-bold mb-2">Select Account</Form.Label>
            <Dropdown>
              <Dropdown.Toggle variant="outline-success" id="dropdown-account">
                {maskAccountNumber(selectedAccount.accountNo)} ({selectedAccount.type})
              </Dropdown.Toggle>
              <Dropdown.Menu>
                {allAccounts.map((acc, idx) => (
                  <Dropdown.Item
                    key={acc.accountNo}
                    onClick={() => setSelected(idx)}
                    active={selected === idx}
                  >
                    {maskAccountNumber(acc.accountNo)} ({acc.type})
                  </Dropdown.Item>
                ))}
              </Dropdown.Menu>
            </Dropdown>
          </div>

          <div className="mt-3 mt-md-0 text-md-end">
            <div className="fw-bold">Account Number: {selectedAccount.accountNo}</div>
            <div className="h5 fw-bold text-success">
              ₹ {selectedAccount.balance.toLocaleString()}
            </div>
          </div>
        </div>
      </div>

      {/* Transactions Box */}
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center flex-wrap">
          <span className="fw-bold">Transaction History</span>
          
          <div className="d-flex flex-column align-items-start gap-2">
            {/* Method Filter */}
            <Form.Select
              size="sm"
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              style={{ width: "150px" }}
            >
              <option value="All">All Methods</option>
              <option value="NEFT">NEFT</option>
              <option value="RTGS">RTGS</option>
              <option value="IMPS">IMPS</option>
            </Form.Select>

            {/* From Date */}
            <Form.Control
              type="date"
              size="sm"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{ minWidth: "160px" }}
            />

            {/* To Date */}
            <Form.Control
              type="date"
              size="sm"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{ minWidth: "160px" }}
            />

            {/* Download Dropdown */}
            <Dropdown as={ButtonGroup}>
              <Dropdown.Toggle variant="outline-secondary" size="sm" id="export-dropdown">
                Download
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={exportExcel}>Export as Excel</Dropdown.Item>
                <Dropdown.Item onClick={exportPDF}>Export as PDF</Dropdown.Item>
                <Dropdown.Item onClick={exportJSON}>Export as JSON</Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        <div className="card-body p-0">
          <Table bordered responsive className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Transaction ID</th>
                <th>Date</th>
                <th>Account Number</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Running Balance</th>
              </tr>
            </thead>
            <tbody>
              {filteredTxns.length ? (
                filteredTxns.map((txn) => (
                  <tr key={txn.id}>
                    <td>{txn.id}</td>
                    <td>{txn.date}</td>
                    <td>{txn.accountNo}</td>
                    <td className={txn.amount.startsWith("-") ? "text-danger" : "text-success"}>
                      {txn.amount}
                    </td>
                    <td>{txn.method}</td>
                    <td>₹ {txn.balance}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-3">
                    No transactions match the filters.
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </div>
      </div>
    </div>
  );
}
