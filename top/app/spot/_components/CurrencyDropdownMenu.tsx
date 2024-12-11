"use client";

import React, { useState } from "react";
import { AiOutlineCheck } from "react-icons/ai";
import styles from "../styles/CurrencyDropdownMenu.module.css";

const CurrencyDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("USDT");

  const currencies = ["USDT", "BTC", "ETH", "TON"];

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (currency: string) => {
    setSelectedCurrency(currency);
    setIsOpen(false); // Close the dropdown
  };

  return (
    <div className={styles.currencyDropdown}>
      <div className="dropdownHeader" onClick={toggleDropdown}>
        {selectedCurrency}
      </div>
      {isOpen && (
        <div className="dropdownMenu">
          {currencies.map((currency) => (
            <div
              key={currency}
              className={`dropdownItem ${
                currency === selectedCurrency ? "active" : ""
              }`}
              onClick={() => handleSelect(currency)}
            >
              {currency}
              {currency === selectedCurrency && (
                <AiOutlineCheck className="checkIcon" />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CurrencyDropdown;
