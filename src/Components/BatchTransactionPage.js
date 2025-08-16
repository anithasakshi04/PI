import React, { useState } from "react";
import { Table, Form, Button } from "react-bootstrap";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import batchData from "../Data/batchData.json"; // adjust path as needed

export default function BatchTransactionPage() {
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [filters, setFilters] = useState({ dept: "", year: "", location: "" });
  const [selectedUserId, setSelectedUserId] = useState("");

  const selectedBatch = batchData.find((b) => b.id === selectedBatchId);

  // Find all possible values for filters, built from the batch user list
  const depts = selectedBatch
    ? Array.from(new Set(selectedBatch.users.map((u) => u.dept))).sort()
    : [];
  const years = selectedBatch
    ? Array.from(new Set(selectedBatch.users.map((u) => u.year))).sort()
    : [];
  const locations = selectedBatch
    ? Array.from(new Set(selectedBatch.users.map((u) => u.location))).sort()
    : [];

  // Apply filters to user list
  const filteredUsers = selectedBatch
    ? selectedBatch.users.filter(
        (u) =>
          (!filters.dept || u.dept === filters.dept) &&
          (!filters.year || u.year === filters.year) &&
          (!filters.location || u.location === filters.location)
      )
    : [];

  // Transactions for selected user in selected batch
  const userTransactions =
    selectedBatch && selectedUserId
      ? selectedBatch.transactions.filter((txn) => txn.userId === selectedUserId)
      : [];

  // Export functions
  const exportExcel = () => {
    if (!selectedBatch || !selectedUserId) return;
    const user = selectedBatch.users.find((u) => u.id === selectedUserId);

    const wsData = [
      ["Batch ID", selectedBatch.id],
      ["User", user?.name || ""],
      [],
      ["Transaction ID", "Amount", "Payment Type", "Payment Date", "Status"],
      ...userTransactions.map((txn) => [
        txn.txnId,
        txn.amount,
        txn.paymentType,
        txn.paymentDate,
        txn.status,
      ]),
    ];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    XLSX.utils.book_append_sheet(wb, ws, "Transactions");
    XLSX.writeFile(wb, "UserTransactions.xlsx");
  };

  const exportPDF = () => {
    if (!selectedBatch || !selectedUserId) return;
    const user = selectedBatch.users.find((u) => u.id === selectedUserId);

    const doc = new jsPDF();
    doc.text(`Batch ID: ${selectedBatch.id}`, 10, 10);
    doc.text(`User: ${user?.name || ""}`, 10, 18);

    const columns = [
      "Transaction ID",
      "Amount",
      "Payment Type",
      "Payment Date",
      "Status",
    ];
    const rows = userTransactions.map((txn) => [
      txn.txnId,
      txn.amount,
      txn.paymentType,
      txn.paymentDate,
      txn.status,
    ]);
    doc.autoTable({
      head: [columns],
      body: rows,
      startY: 26,
    });

    doc.save("UserTransactions.pdf");
  };

  const exportJSON = () => {
    if (!selectedBatch || !selectedUserId) return;
    const user = selectedBatch.users.find((u) => u.id === selectedUserId);
    const data = {
      batchId: selectedBatch.id,
      user: user?.name || "",
      transactions: userTransactions,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: "application/json",
    });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "UserTransactions.json";
    link.click();
  };

  // Main render
  return (
    <div className="d-flex" style={{ minHeight: "80vh" }}>
      {/* SIDEBAR */}
      <div className="p-3 border-end" style={{ minWidth: 220, background: "#f7f7f7" }}>
        <strong>BATCH LIST</strong>
        {batchData.map((batch) => (
          <div
            key={batch.id}
            onClick={() => {
              if (batch.status === "Approved") {
                setSelectedBatchId(batch.id);
                setFilters({ dept: "", year: "", location: "" });
                setSelectedUserId("");
              }
            }}
            style={{
              background: selectedBatchId === batch.id ? "#c8dafb" : "#eee",
              cursor: batch.status === "Approved" ? "pointer" : "not-allowed",
              opacity: batch.status === "Approved" ? 1 : 0.5,
              margin: "10px 0",
              padding: "12px",
              borderRadius: 4,
            }}
          >
            Batch {batch.id} <span style={{ float: "right", fontWeight: "600" }}>{batch.status}</span>
          </div>
        ))}
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-grow-1 p-4">
        {selectedBatch ? (
          <>
            <h5>Batch {selectedBatch.id}</h5>

            <Form className="row g-3 align-items-center mb-3">
              <div className="col-auto">
                <Form.Select
                  aria-label="Department"
                  size="sm"
                  value={filters.dept}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, dept: e.target.value, location: "", year: "" }))
                  }
                >
                  <option value="">Department</option>
                  {depts.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </Form.Select>
              </div>
              <div className="col-auto">
                <Form.Select
                  aria-label="Joining Year"
                  size="sm"
                  value={filters.year}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, year: e.target.value }))
                  }
                  disabled={!filters.dept}
                >
                  <option value="">Joining Year</option>
                  {years
                    .filter(
                      (y) => !filters.dept || selectedBatch.users.some((u) => u.year === y && u.dept === filters.dept)
                    )
                    .map((y) => (
                      <option key={y} value={y}>{y}</option>
                    ))}
                </Form.Select>
              </div>
              <div className="col-auto">
                <Form.Select
                  aria-label="Location"
                  size="sm"
                  value={filters.location}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, location: e.target.value }))
                  }
                  disabled={!filters.dept}
                >
                  <option value="">Location</option>
                  {locations
                    .filter(
                      (loc) => !filters.dept || selectedBatch.users.some((u) => u.location === loc && u.dept === filters.dept)
                    )
                    .map((loc) => (
                      <option key={loc} value={loc}>{loc}</option>
                    ))}
                </Form.Select>
              </div>
              <div className="col-auto">
                <Form.Check
                  inline
                  type="radio"
                  label="Single"
                  name="transactionType"
                  id="singleTxn"
                  checked={true}
                  disabled
                />
                <Form.Check
                  inline
                  type="radio"
                  label="Multiple"
                  name="transactionType"
                  id="multiTxn"
                  disabled
                />
              </div>
              <div className="col-auto" style={{ minWidth: 230 }}>
                <Form.Select
                  size="sm"
                  value={selectedUserId}
                  onChange={(e) => setSelectedUserId(e.target.value)}
                  disabled={filteredUsers.length === 0}
                >
                  <option value="">Select User</option>
                  {filteredUsers.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.dept}, {user.year}, {user.location})
                    </option>
                  ))}
                </Form.Select>
              </div>
            </Form>

            {/* TRANSACTION DETAILS TABLE */}
            {selectedUserId && (
              <div className="card shadow-sm">
                <div className="card-header fw-bold">Transaction Details</div>
                <div className="card-body p-0">
                  <Table bordered responsive hover size="sm" className="mb-0 align-middle">
                    <thead className="table-light">
                        <tr>
                            <th>Transaction ID</th>
                            <th>Amount</th>
                            <th>Payment Type</th>
                            <th>Payment Method</th>  {/* New column header */}
                            <th>Payment Date</th>
                            <th>Status</th>
                        </tr>
                    </thead>

                    <tbody>
                      {userTransactions.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center text-muted py-3">
                            No transactions found for this user.
                          </td>
                        </tr>
                      ) : (
                        userTransactions.map((txn) => (
                        <tr key={txn.txnId}>
                            <td>{txn.txnId}</td>
                            <td>{txn.amount}</td>
                            <td>{txn.paymentType}</td>
                            <td>{txn.paymentMethod}</td>  {/* New column */}
                            <td>{txn.paymentDate}</td>
                            <td>{txn.status}</td>
                        </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
                <div className="p-3 d-flex gap-2">
                  <Button variant="outline-primary" size="sm" onClick={exportExcel}>
                    Export Excel
                  </Button>
                  <Button variant="outline-danger" size="sm" onClick={exportPDF}>
                    Export PDF
                  </Button>
                  <Button variant="outline-secondary" size="sm" onClick={exportJSON}>
                    Export JSON
                  </Button>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="text-muted">Please select an approved batch.</div>
        )}
      </div>
    </div>
  );
}
