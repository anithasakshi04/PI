// src/Layout/MainLayout.js
import React, { useState } from "react";
import { FaUserCircle, FaSignOutAlt, FaCog, FaBars } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";  // Added useNavigate for Back button
import "bootstrap/dist/css/bootstrap.min.css";
import Dropdown from "react-bootstrap/Dropdown";
import DropdownButton from "react-bootstrap/DropdownButton";
// import SCB from "../assests/Images/SCB.jpg";   // Header logo
import SCB1 from "../assests/Images/SCB1.jpg"; // Background logo

export default function MainLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Currency dropdown state
  const [currency, setCurrency] = useState("INR (India)");
  const handleSelect = (eventKey) => setCurrency(eventKey);

  // Mock user (replace with real auth)
  const user = { name: "John Doe", email: "john@example.com", accessLevel: 2 };

  // Overlay alpha
  const overlayAlpha = sidebarOpen ? 0.6 : 0.08;
  const closeSidebar = () => setSidebarOpen(false);

  // For Back button navigation
  const navigate = useNavigate();

  return (
    <div className="d-flex flex-column vh-100 position-relative" style={{ overflow: "hidden" }}>

      {/* HEADER */}
      <header className="d-flex align-items-center justify-content-between bg-primary bg-opacity-75 px-3 py-2" style={{ zIndex: 1051 }}>
        <div className="d-flex align-items-center">
          {/* Hamburger */}
          <button className="btn btn-primary  me-3" onClick={() => setSidebarOpen(!sidebarOpen)}>
            <FaBars size={20} className="text-white" />
          </button>
          {/* Header logo */}
          {/* <img alt="Standard Chartered" src={SCB} width="120" height="32" /> */}
        </div>
        <div className="d-flex align-items-center">
          <Dropdown align="end" className="mx-3" >
                <Dropdown.Toggle
                  as="span"
                  style={{ cursor: "pointer" }}
                  id="user-dropdown">
                  <FaUserCircle size={28} className="text-white mx-3" />
                </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.ItemText>
                  <div className="fw-bold">{user.name}</div>
                  <div style={{ fontSize: "0.9em" }}>{user.email}</div>
                  <div style={{ fontSize: "0.85em" }}>Access Level: {user.accessLevel}</div>
                </Dropdown.ItemText>
                {/* Optionally add "Profile" link, etc. */}
              </Dropdown.Menu>
            </Dropdown>
          <button className="btn btn- me-2">
            LOGOUT <FaSignOutAlt />
          </button>
          <FaCog size={24} className="text-white" />
        </div>
      </header>

      {/* ACTION BAR */}
      <div className="d-flex align-items-center w-100 px-4 py-2 bg-primary bg-opacity-50"
        style={{
          borderBottom: "1px solid #e9ecef",
          position: "relative",
          zIndex: 2,
          minHeight: "48px",
          color: "white"
        }}
      >
        {/* BACK BUTTON navigates to Home */}
        <button className="btn btn-primary btn-sm me-3" onClick={() => navigate("/home")}>&lt; Back</button>

        {/* Dynamic access level */}
        <span className="fw-bold">Access Level : {user.accessLevel}</span>

        {/* Currency dropdown */}
        <span className="ms-auto fw-bold d-flex align-items-center color-white ">
          <DropdownButton
            id="currency-dropdown"
            title={currency}
            variant="primary"
            onSelect={handleSelect}
            className="ms-2"
          >
            <Dropdown.Item eventKey="INR (India)">INR (India)</Dropdown.Item>
            <Dropdown.Item eventKey="USD (United States)">USD (United States)</Dropdown.Item>
            <Dropdown.Item eventKey="EUR (Euro)">EUR (Euro)</Dropdown.Item>
            <Dropdown.Item eventKey="GBP (United Kingdom)">GBP (United Kingdom)</Dropdown.Item>
          </DropdownButton>
        </span>
      </div>

      {/* BODY */}
      <div className="flex-grow-1 d-flex position-relative"
        style={{
          minHeight: 0,
          backgroundColor: "#fff",
          backgroundImage: `url(${SCB1})`,
          backgroundSize: "26% auto",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          transition: "background 0.3s"
        }}
      >
        {/* Light overlay */}
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `rgba(255,255,255,${overlayAlpha})`,
          transition: "background 0.3s",
          zIndex: 1,
          pointerEvents: "none"
        }} />

        {/* SIDEBAR */}
        {sidebarOpen && (
          <aside className="bg-primary bg-opacity-25 px-3 py-3 d-flex flex-column gap-3"
            style={{
              width: 200,
              minWidth: 120,
              zIndex: 1052,
              position: "relative",
              boxShadow: "2px 0 10px rgba(0,0,0,0.14)"
            }}
          >
            {/* HOME LINK */}
            <Link
              to="/home"
              className="btn btn-outline-success fw-bold w-100"
              style={{ letterSpacing: "1px", textAlign: "center" , color:"white",backgroundColor:"#0473EA"}}
              onClick={closeSidebar}
            >
              Home
            </Link>

            {/* ACCOUNT BALANCE LINK */}
            <Link
              to="/accountbalance"
              className="btn btn-outline-success fw-bold w-100 "
              style={{ letterSpacing: "1px", textAlign: "center",color:"white",backgroundColor:"#0473EA" }}
              onClick={closeSidebar}
            >
              Account Balance
            </Link>
          </aside>
        )}

        {/* MAIN CONTENT */}
        <main className="flex-grow-1 d-flex flex-column align-items-center pt-4" style={{ zIndex: 2 }}>
          {children}
        </main>
      </div>

      {/* Overlay to close sidebar */}
      {sidebarOpen && (
        <div onClick={closeSidebar}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            height: "100vh",
            width: "100vw",
            backgroundColor: "transparent",
            zIndex: 1049
          }}
        />
      )}

      {/* FOOTER */}
      {/* <footer className="bg-success px-3 py-2 text-white text-center" style={{ zIndex: 1051 }}>
        Footer
      </footer> */}
    </div>
  );
}
