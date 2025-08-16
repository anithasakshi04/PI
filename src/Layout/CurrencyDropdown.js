// // CurrencyDropdown.js
// import React, { useState } from "react";
// import Dropdown from "react-bootstrap/Dropdown";
// import DropdownButton from "react-bootstrap/DropdownButton";

// function CurrencyDropdown() {
//   const [currency, setCurrency] = useState("INR (India)");

//   const handleSelect = (eventKey) => {
//     setCurrency(eventKey);
//   };

//   return (
//     <DropdownButton
//       id="currency-dropdown"
//       title={currency}
//       variant="success"
//       onSelect={handleSelect}
//       className="ms-2"
//     >
//       <Dropdown.Item eventKey="INR (India)">INR (India)</Dropdown.Item>
//       <Dropdown.Item eventKey="USD (United States)">USD (United States)</Dropdown.Item>
//       <Dropdown.Item eventKey="EUR (Euro)">EUR (Euro)</Dropdown.Item>
//       <Dropdown.Item eventKey="GBP (United Kingdom)">GBP (United Kingdom)</Dropdown.Item>
//     </DropdownButton>
//   );
// }

// export default CurrencyDropdown;
