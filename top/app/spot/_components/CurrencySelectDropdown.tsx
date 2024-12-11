"use client";

import React, { useState } from "react";
import { AiOutlineCheck } from "react-icons/ai";
import { FaChevronDown } from "react-icons/fa";
import "../styles/CurrencySelectDropdown.module.css";

const CurrencySelectDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState("USDT");

  const currencies = [
    { label: "USDT", icon: "/images/usdt.png" },
    { label: "BTC", icon: "/images/btc.png" },
    { label: "ETH", icon: "/images/eth.png" },
    { label: "TON", icon: "/images/ton.png" },
  ];

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleSelect = (currency: string) => {
    setSelectedCurrency(currency);
    setIsOpen(false);
  };

  return (
    <div className="currencyDropdown">
      <div className="selectField" onClick={toggleDropdown}>
        <p className="selectText">{selectedCurrency}</p>
        <FaChevronDown
          className={`arrowIcon ${isOpen ? "rotate" : ""}`}
          size={16}
        />
      </div>

      {isOpen && (
        <ul className="dropdownList">
          {currencies.map((currency) => (
            <li
              key={currency.label}
              className="dropdownOption"
              onClick={() => handleSelect(currency.label)}
            >
              <img src={currency.icon} alt={currency.label} className="optionIcon" />
              <p>{currency.label}</p>
              {selectedCurrency === currency.label && (
                <AiOutlineCheck className="checkIcon" />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CurrencySelectDropdown;
