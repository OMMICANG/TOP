"use client";

import React, { useState } from "react";
import Select, { Option } from "rc-select";
import BackIcon from "./_components/BackIcon";
import { RiFileList2Line } from "react-icons/ri";
import P2pMenuIcon from "./_components/p2pMenuIcon"
import BuyPage from "./_components/BuyPage";
import SellPage from "./_components/SellPage";
import "rc-select/assets/index.css"; // Import rc-select styles
import "../styles/Spot.css";

const Spot = () => {
  const [activeOption, setActiveOption] = useState<"Buy" | "Sell">("Buy");
  const [selectedCurrency, setSelectedCurrency] = useState("USDT");
  const [selectedExchange, setSelectedExchange] = useState("BINANCE");
  const [selectedBank, setSelectedBank] = useState("VFD");
  const [isOpen, setIsOpen] = useState(false); // Dropdown visibility
  const [amount, setAmount] = useState(""); // Input value


  const handleCurrencyChange = (value: string) => {
    setSelectedCurrency(value);
  }

  const handleExchangeChange = (value: string) => {
    setSelectedExchange(value);
  }

  const falseValue = false;

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleConfirm = () => {
    setIsOpen(false); // Close the dropdown after confirming
  };

    const handleBankChange = (value: string) => {
    setSelectedBank(value);
  }


  return (

    <div className="bodyContainer">

      <div className="upperIndex">

        <div className="topHeaderContainer">

          <div className="backIcon">
          <BackIcon />
          </div>

          <div className="centerHeaderText neon">spot [p2p]</div>

          <div className="iconContainer">
            <div className="icons"><RiFileList2Line /></div>
            <div className="menuIcon vt323-regular"><P2pMenuIcon /></div>
        </div>


          

        </div>

        <div className="tradeFiatFiltersContainer">
          <div className="buttonContainer">
            <button
                onClick={() => setActiveOption("Buy")}
                className={`${"button"} ${
                activeOption === "Buy" ? "activeBuy" : ""
              }`}
            >
              Buy
            </button>
            <button
                onClick={() => setActiveOption("Sell")}
                className={`${"button"} ${
                activeOption === "Sell" ? "activeSell" : ""
              }`}
            >
              Sell
            </button>

          </div>
          

            <div className="fiatSelectContainer">
              <select 
                className="filtersSelect" 
                name="filtersSelect" 
                id="fiat"
                disabled={true}
              >
                <option value="">NGN</option>
              </select>

            </div>

            <div className="filtersSelectContainer">
            <select 
                className="filtersSelect" 
                name="filtersSelect" 
                id="filter"
                disabled={true}
              >
                <option value="">Filter</option>
              </select>
            </div>
        </div>

        <div className="tradeFiatFiltersContainer tradeFiatFiltersContainer2">

          <div className="currencySelectContainer">

          <Select
              value={selectedCurrency}
              onChange={handleCurrencyChange}
              className= "currencySelect"
              dropdownClassName="currencyDropdownSelect"
              dropdownMatchSelectWidth = {falseValue}
            >
              <Option value="USDT">USDT</Option>
              <Option value="BTC">BTC</Option>
              <Option value="ETH">ETH</Option>
              <Option value="TON">TON</Option>
          </Select>
          </div>

          <div className="exchangeSelectContainer">

          <Select
              value={selectedExchange}
              onChange={handleExchangeChange}
              className= "currencySelect"
              dropdownClassName="currencyDropdownSelect"
              dropdownMatchSelectWidth = {falseValue}
            >
              <Option value="BINANCE">BINANCE</Option>
              <Option value="BYBIT">BYBIT</Option>
              <Option value="BITGET">BITGET</Option>
              <Option value="KUCOIN">KUCOIN</Option>
          </Select>
            {/* <select 
                className="filtersSelect" 
                name="filtersSelect" 
                id="filter"
                disabled={false}
              >
                <option value="">EXCHANGE</option>
              </select> */}

          </div>

          <div className="amountSelectContainer">

             <div className="amountPlaceholder" onClick={toggleDropdown}>
                {amount || "AMOUNT"}
            </div>

      {isOpen && (
        <div className="dropdownContent">
          <input
            type="number"
            className="amountInput"
            placeholder="Enter amount"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
          <button
            className="confirmButton"
            onClick={handleConfirm}
          >
            Confirm
          </button>
            {/* <select 
                className="filtersSelect" 
                name="filtersSelect" 
                id="filter"
                disabled={false}
              >
                <option value="">AMOUNT</option>
              </select> */}
          </div>
        )}
          </div>

          <div className="bankSelectContainer">

<Select
              value={selectedBank}
              onChange={handleBankChange}
              className= "currencySelect"
              dropdownClassName="currencyDropdownSelect"
              dropdownMatchSelectWidth = {falseValue}
            >
              <Option value="ACCESS">Access</Option>
              <Option value="FCMB">FCMB</Option>
              <Option value="GTB">GTB</Option>
              <Option value="OPAY">OPAY</Option>
              <Option value="KUDA">KUDA</Option>
              <Option value="VFD">VFD</Option>
          </Select>

            {/* <select 
                className="filtersSelect" 
                name="filtersSelect" 
                id="filter"
                disabled={false}
              >
                <option value="">BANK</option>
              </select> */}
          </div>
        </div>

      </div>

      <div className="p2pMarketDisplayPage">
        {activeOption === "Buy" ? <BuyPage /> : <SellPage />}
      </div>


    </div>



  );
};

export default Spot;
