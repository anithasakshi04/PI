// src/Components/BatchTransactionPage.js
import React, { useState, useEffect } from "react";
import batchData from "../Data/batchData.json";
import vendorsData from "../Data/vendorData.json";
import "bootstrap/dist/css/bootstrap.min.css";
import jsPDF from "jspdf";
import "jspdf-autotable";

const BatchTransactionPage = () => {
  const batches = [
    { batchId: "E000021", status: "Approved", data: batchData[0] },
    { batchId: "E000431", status: "Approved", data: batchData[1] },
    { batchId: "V000012", status: "Approved", data: vendorsData[0]},
    { batchId: "V000013", status: "In-Process", data: vendorsData[1] 
    },
  ];

  const [selectedBatch, setSelectedBatch] = useState(batches[0]);
  const [selectedUser, setSelectedUser] = useState("");
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedYear, setSelectedYear] = useState("");
  const [selectedLoc, setSelectedLoc] = useState("");
  const [mode, setMode] = useState("single");

  // Reset selected user whenever filters or batch change
  useEffect(() => {
    setSelectedUser("");
  }, [selectedDept, selectedYear, selectedLoc, selectedBatch]);

  const handleBatchClick = (batch) => {
    if (batch.status === "In-Process") return;
    setSelectedBatch(batch);
    setSelectedUser("");
    setSelectedDept("");
    setSelectedYear("");
    setSelectedLoc("");
    setMode("single");
  };

  // --- FILTER transactions safely ---
  const filteredTransactions = (selectedBatch?.data?.transactions || []).filter(
    (txn) => {
      if (!txn) return false;

      if (selectedBatch.batchId.startsWith("E")) {
        // Department filter
        if (selectedDept && txn.department.toLowerCase() !== selectedDept.toLowerCase())
          return false;
        // Year filter
        if (selectedYear && txn.joiningYear !== selectedYear) return false;
        // Location filter
        if (selectedLoc && txn.location.toLowerCase() !== selectedLoc.toLowerCase())
          return false;
      }

      return true;
    }
  );

  // 🔑 Determine batch name dynamically for display
  const getBatchName = (batchId) => {
    const employeeBatches = ["E000021", "E000431"];
    if (employeeBatches.includes(batchId)) {
      return "Employee Payroll / Employee Payroll";
    }
    return batchId.startsWith("V") ? "Vendor Payments" : "Employee Payroll";
  };

  // --- USER/VENDOR LIST ---
  const users = (selectedBatch.batchId.startsWith("E")
    ? filteredTransactions.map((txn, idx) => ({
        label: txn.toAccount,
        value: txn.id,
        txn,
        batchName: getBatchName(selectedBatch.batchId),
      }))
    : filteredTransactions.map((txn) => ({
        label: txn.toAccount,
        value: txn.id,
        txn,
        batchName: getBatchName(selectedBatch.batchId),
      }))
  );

const downloadPDF = () => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text(`Batch ${selectedBatch.batchId} - Transaction Summary`, 14, 20);

  const tableColumn = [
    "Batch Name",
    "Transaction ID",
    "Amount (INR)",
    "Method",
    "Status",
    "Date",
    "Pay From",
    "Pay To",
    "Description",
  ];

  const tableRows = [];

  const dataToExport =
    mode === "single" && selectedUser
      ? users.filter((u) => u.value === selectedUser)
      : users;

  dataToExport.forEach((u) => {
    const txn = u.txn;
    const row = [
      u.batchName,
      txn.id,
      Math.abs(txn.amount),
      txn.method,
      txn.status,
      txn.date,
      selectedBatch.data.accountNo,
      u.label,
      txn.description,
    ];
    tableRows.push(row);
  });

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 30,
    styles: { fontSize: 10 },
    headStyles: { fillColor: [41, 128, 185] },
  });

  doc.save(`Batch_${selectedBatch.batchId}_Transactions.pdf`);
};

  return (
    <div className="container-fluid vh-100 d-flex flex-column p-0">
      <div className="row flex-grow-1 m-0 overflow-hidden">
        {/* Batch List */}
        <div className="col-3 border-end bg-light overflow-auto p-0">
          <div className="list-group list-group-flush">
            {batches.map((batch) => (
              <button
                key={batch.batchId}
                className={`list-group-item list-group-item-action d-flex justify-content-between align-items-center ${
                  selectedBatch.batchId === batch.batchId ? "active" : ""
                }`}
                onClick={() => handleBatchClick(batch)}
                disabled={batch.status === "In-Process"}
              >
                Batch {batch.batchId}
                <span
                  className={`badge ${
                    batch.status === "Approved" ? "bg-success" : "bg-warning"
                  }`}
                >
                  {batch.status}
                </span>
              </button>
            ))}
          </div>
          <div className="p-2 small text-muted border-top">
            <i>Can’t View/Print In-Process Batch</i>
          </div>
        </div>

        {/* Batch Details */}
        <div className="col-9 p-3 overflow-auto">
          <h5 className="fw-bold mb-3">Batch {selectedBatch.batchId}</h5>

          {/* Filters */}
          <div className="d-flex flex-wrap gap-3 mb-3">
            {selectedBatch.batchId.startsWith("E") && (
              <>
                <select
                  className="form-select w-auto"
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                >
                  <option value="">Department</option>
                  <option value="it">IT</option>
                  <option value="finance">Finance</option>
                  <option value="hr">HR</option>
                </select>
                <select
                  className="form-select w-auto"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="">Joining Year</option>
                  <option value="2024">2024</option>
                  <option value="2025">2025</option>
                </select>
                <select
                  className="form-select w-auto"
                  value={selectedLoc}
                  onChange={(e) => setSelectedLoc(e.target.value)}
                >
                  <option value="">Location</option>
                  <option value="chennai">Chennai</option>
                  <option value="bangalore">Bangalore</option>
                </select>
              </>
            )}

            <select
              className="form-select w-auto"
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
            >
              <option value="">
                {selectedBatch.batchId.startsWith("E")
                  ? "Select Employee"
                  : "Select Vendor"}
              </option>
              {users.map((u, idx) => (
                <option key={idx} value={u.value}>
                  {u.label}
                </option>
              ))}
            </select>
          </div>

          {/* Transaction Mode */}
          <div className="mb-3">
            <label className="me-3">
              <input
                type="radio"
                name="mode"
                value="single"
                checked={mode === "single"}
                onChange={() => setMode("single")}
              />{" "}
              Single Transaction
            </label>
            <label>
              <input
                type="radio"
                name="mode"
                value="multiple"
                checked={mode === "multiple"}
                onChange={() => setMode("multiple")}
              />{" "}
              Multiple Transactions
            </label>
          </div>

          {/* Payment Summary */}
          <div className="card shadow-sm">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h6 className="mb-0">Payment Summary</h6>
              <button className="btn btn-sm btn-outline-secondary" onClick={downloadPDF}>Download</button>
            </div>
            <div className="card-body p-3">
              {mode === "single" && selectedUser &&
                users
                  .filter((u) => u.value === selectedUser)
                  .map((u, idx) => (
                    <div key={idx} className="mb-4 border-bottom pb-3">
                      <p><strong>Batch Name:</strong> {u.batchName}</p>
                      <p><strong>Transaction ID:</strong> {u.txn.id}</p>
                      <p><strong>Amount:</strong> INR {Math.abs(u.txn.amount)}</p>
                      <p><strong>Method:</strong> {u.txn.method}</p>
                      <p><strong>Status:</strong> {u.txn.status}</p>
                      <p><strong>Date:</strong> {u.txn.date}</p>
                      <p><strong>Pay From:</strong> {selectedBatch.data.accountNo}</p>
                      <p><strong>Pay To:</strong> {u.label}</p>
                      <p><strong>Description:</strong> {u.txn.description}</p>
                    </div>
                  ))
              }

              {mode === "multiple" &&
                users.map((u, idx) => (
                  <div key={idx} className="mb-4 border-bottom pb-3">
                    <p><strong>Batch Name:</strong> {u.batchName}</p>
                    <p><strong>Transaction ID:</strong> {u.txn.id}</p>
                    <p><strong>Amount:</strong> INR {Math.abs(u.txn.amount)}</p>
                    <p><strong>Method:</strong> {u.txn.method}</p>
                    <p><strong>Status:</strong> {u.txn.status}</p>
                    <p><strong>Date:</strong> {u.txn.date}</p>
                    <p><strong>Pay From:</strong> {selectedBatch.data.accountNo}</p>
                    <p><strong>Pay To:</strong> {u.label}</p>
                    <p><strong>Description:</strong> {u.txn.description}</p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BatchTransactionPage;
