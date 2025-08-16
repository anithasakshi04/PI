// src/Components/AccountBalance.js
import React, { useMemo, useState } from "react";
import { Dropdown, Table, Form, ButtonGroup } from "react-bootstrap";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";

// Import both datasets
import batchData from "../Data/batchData.json";
import vendorData from "../Data/vendorData.json";

// Mask account number
function maskAccountNumber(accNo = "") {
  if (!accNo) return "";
  const s = String(accNo);
  if (s.length <= 8) return s;
  return s.slice(0, 4) + "****" + s.slice(-4);
}

// Extract YYYY-MM-DD
function toDateOnly(d) {
  return String(d).split(" ")[0];
}

// 🔑 Expand each batch into detailed transactions
function expandBatch(batch, isVendor = false) {
  if (!batch || !batch.transactions) return [];

  const batchName = isVendor ? "Vendor Payments" : "Employee Payroll";
  const approvalDate = batch.approvalDate; // only for employee batches

  return batch.transactions
    .filter((txn) => txn.status !== "Pending") // exclude pending
    .map((txn) => {
      const txnDate = !isVendor && approvalDate ? approvalDate : txn.date;

      return {
        id: txn.id,
        batchId: isVendor ? `V-${txn.id.split("-")[1]}` : `E-${txn.id.split("-")[1]}`,
        batchName,
        date: txnDate,
        toAccountDisplay: txn.toAccount,
        amountNumber: -Math.abs(txn.amount), // debit from company
        method: txn.method,
        status: txn.status || "Approved",
      };
    });
}

export default function AccountBalance() {
  const [selected, setSelected] = useState(0);
  const [filterMethod, setFilterMethod] = useState("All");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Merge both employee + vendor accounts
  const allAccounts = useMemo(() => [...batchData, ...vendorData], []);

  const selectedAccount =
    allAccounts[selected] || {
      type: "",
      accountNo: "",
      openingBalance: 0,
      transactions: [],
    };

  // 🔑 Expand all accounts into transactions with running balance
  const enrichedTxns = useMemo(() => {
    let running = selectedAccount.openingBalance;

    return allAccounts
      .flatMap((acc) =>
        acc.accountNo.startsWith("789") // vendor account
          ? expandBatch(acc, true)
          : expandBatch(acc, false)
      )
      .map((txn) => {
        running += txn.amountNumber;
        return { ...txn, runningBalance: running };
      });
  }, [allAccounts, selectedAccount]);

  // Apply filters
  const filteredTxns = useMemo(() => {
    return enrichedTxns.filter((txn) => {
      if (filterMethod !== "All" && txn.method !== filterMethod) return false;
      const d = toDateOnly(txn.date);
      if (fromDate && d < fromDate) return false;
      if (toDate && d > toDate) return false;
      return true;
    });
  }, [enrichedTxns, filterMethod, fromDate, toDate]);

  const currentBalance =
    enrichedTxns.length > 0
      ? enrichedTxns[enrichedTxns.length - 1].runningBalance
      : selectedAccount.openingBalance;

  // --- EXPORT FUNCTIONS ---
  const exportExcel = () => {
    const wsData = [
      ["Account Type", selectedAccount.type],
      ["Account Number", selectedAccount.accountNo],
      ["Opening Balance", selectedAccount.openingBalance],
      ["Current Balance", `₹ ${currentBalance.toLocaleString()}`],
      [],
      [
        "Batch ID",
        "Batch Name",
        "Transaction ID",
        "Date",
        "Counterparty",
        "Amount",
        "Status",
        "Running Balance",
      ],
      ...filteredTxns.map((txn) => [
        txn.batchId,
        txn.batchName,
        txn.id,
        txn.date,
        txn.toAccountDisplay,
        txn.amountNumber.toLocaleString("en-IN"),
        txn.status,
        `₹ ${txn.runningBalance.toLocaleString("en-IN")}`,
      ]),
    ];

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(
      wb,
      `Account_${selectedAccount.accountNo}_Transactions.xlsx`
    );
  };

  const exportPDF = () => {
    const doc = new jsPDF();
    doc.text(`Account Type: ${selectedAccount.type}`, 10, 10);
    doc.text(`Account Number: ${selectedAccount.accountNo}`, 10, 18);
    doc.text(
      `Current Balance: ₹ ${currentBalance.toLocaleString("en-IN")}`,
      10,
      26
    );

    const columns = [
      "Batch ID",
      "Batch Name",
      "Transaction ID",
      "Date",
      "Counterparty",
      "Amount",
      "Status",
      "Running Balance",
    ];
    const rows = filteredTxns.map((txn) => [
      txn.batchId,
      txn.batchName,
      txn.id,
      txn.date,
      txn.toAccountDisplay,
      txn.amountNumber.toLocaleString("en-IN"),
      txn.status,
      `₹ ${txn.runningBalance.toLocaleString("en-IN")}`,
    ]);

    doc.autoTable({ head: [columns], body: rows, startY: 34 });
    doc.save(`Account_${selectedAccount.accountNo}_Transactions.pdf`);
  };

  const exportJSON = () => {
    const data = {
      accountType: selectedAccount.type,
      accountNumber: selectedAccount.accountNo,
      openingBalance: selectedAccount.openingBalance,
      currentBalance,
      transactions: filteredTxns,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Account_${selectedAccount.accountNo}_Transactions.json`;
    link.click();
  };

  return (
    <div className="container py-4">
      {/* Account Info */}
      <div className="card mb-4 shadow-sm">
        <div className="card-body d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
          <div>
            <Form.Label className="fw-bold mb-2">Select Account</Form.Label>
            <Dropdown>
              <Dropdown.Toggle variant="outline-success" id="dropdown-account">
                {maskAccountNumber(selectedAccount.accountNo)} (
                {selectedAccount.type})
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
            <div className="fw-bold">
              Account Number: {selectedAccount.accountNo}
            </div>
            <div className="h5 fw-bold text-success">
              Current Balance: ₹ {currentBalance.toLocaleString("en-IN")}
            </div>
          </div>
        </div>
      </div>

      {/* Filters + Table */}
      <div className="card shadow-sm">
        <div className="card-header d-flex justify-content-between align-items-center flex-wrap">
          <span className="fw-bold">Transaction History</span>
          <div className="d-flex flex-column align-items-start gap-2">
            <Form.Select
              size="sm"
              value={filterMethod}
              onChange={(e) => setFilterMethod(e.target.value)}
              style={{ width: "160px" }}
            >
              <option value="All">All Methods</option>
              <option value="NEFT">NEFT</option>
              <option value="RTGS">RTGS</option>
              <option value="IMPS">IMPS</option>
              <option value="AUTO">AUTO</option>
            </Form.Select>
            <Form.Control
              type="date"
              size="sm"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              style={{ minWidth: "160px" }}
            />
            <Form.Control
              type="date"
              size="sm"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              style={{ minWidth: "160px" }}
            />
            <Dropdown as={ButtonGroup}>
              <Dropdown.Toggle
                variant="outline-secondary"
                size="sm"
                id="export-dropdown"
              >
                Download
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={exportExcel}>
                  Export as Excel
                </Dropdown.Item>
                <Dropdown.Item onClick={exportPDF}>
                  Export as PDF
                </Dropdown.Item>
                <Dropdown.Item onClick={exportJSON}>
                  Export as JSON
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </div>
        </div>

        <div className="card-body p-0">
          <Table bordered responsive className="mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Batch ID</th>
                <th>Batch Name</th>
                <th>Transaction ID</th>
                <th>Date</th>
                <th>Counterparty</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Running Balance</th>
              </tr>
            </thead>
            <tbody>
              {filteredTxns.length ? (
                filteredTxns.map((txn) => (
                  <tr key={txn.id}>
                    <td>{txn.batchId}</td>
                    <td>{txn.batchName}</td>
                    <td>{txn.id}</td>
                    <td>{txn.date}</td>
                    <td>{txn.toAccountDisplay}</td>
                    <td
                      className={
                        txn.amountNumber < 0 ? "text-danger" : "text-success"
                      }
                    >
                      {txn.amountNumber.toLocaleString("en-IN")}
                    </td>
                    <td>{txn.status}</td>
                    <td>₹ {txn.runningBalance.toLocaleString("en-IN")}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="text-center text-muted py-3">
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
