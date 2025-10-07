import React, { useState, useEffect } from "react";
import "./App.css";
import AdminPanel from "./AdminPanel";
import EquipmentList from "./EquipmentList";
import OverviewTab from "./OverviewTab";
import UpgradeToPro from "./UpgradeToPro";
import AISuggestionsTab from "./AISuggestionsTab";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function App() {
  const [activeTab, setActiveTab] = useState(localStorage.getItem("activeTab") || "overview");
  const [peopleCount, setPeopleCount] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const [darkMode, setDarkMode] = useState(localStorage.getItem("darkMode") === "true");

  const toggleDarkMode = () => {
    setDarkMode((prev) => {
      localStorage.setItem("darkMode", !prev);
      return !prev;
    });
  };

  // Check and validate Pro token
  useEffect(() => {
    const validateProToken = async () => {
      const token = localStorage.getItem("proToken");
      if (!token) return setIsPro(false);
      try {
        const res = await fetch(`${API_BASE_URL}/api/validate-token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ token }),
        });
        const data = await res.json();
        if (res.ok && data.valid && data.type === "pro") {
          setIsPro(true);
        } else {
          localStorage.removeItem("proToken");
          setIsPro(false);
        }
      } catch {
        localStorage.removeItem("proToken");
        setIsPro(false);
      }
    };
    validateProToken();
  }, []);

  // Poll gym count
  useEffect(() => {
    const fetchCount = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/gym-count`);
        const data = await res.json();
        setPeopleCount(data?.people_in_gym ?? 0);
      } catch {
        setPeopleCount(0);
      }
    };
    fetchCount();
    const intervalId = setInterval(fetchCount, 5000);
    return () => clearInterval(intervalId);
  }, []);

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    localStorage.setItem("activeTab", tab);
  };

  return (
    <div className={`App ${darkMode ? "dark" : "light"}`}>
      {/* Header */}
      <header className="app-header">
        <h1>{isPro ? "CCU Gym Pro" : "CCU Gym"}</h1>

        <div className="header-buttons">
          {!isPro && (
            <button className="upgrade-btn" onClick={() => setActiveTab("upgrade")}>
              Upgrade to Pro
            </button>
          )}
          <button className="darkmode-btn" onClick={toggleDarkMode}>
            {darkMode ? "Light Mode" : "Dark Mode"}
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="tabs">
        <button className={activeTab === "overview" ? "active" : ""} onClick={() => handleTabClick("overview")}>
          Overview ({peopleCount})
        </button>
        <button className={activeTab === "list" ? "active" : ""} onClick={() => handleTabClick("list")}>
          Equipment
        </button>
        {isPro && (
          <button className={activeTab === "ai" ? "active" : ""} onClick={() => handleTabClick("ai")}>
            AI Suggestions
          </button>
        )}
        <button className={activeTab === "admin" ? "active" : ""} onClick={() => handleTabClick("admin")}>
          Admin
        </button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === "overview" && <OverviewTab darkMode={darkMode} />}
        {activeTab === "list" && <EquipmentList darkMode={darkMode} />}
        {activeTab === "ai" && isPro && <AISuggestionsTab darkMode={darkMode} />}
        {activeTab === "admin" && <AdminPanel darkMode={darkMode} />}
        {activeTab === "upgrade" && <UpgradeToPro darkMode={darkMode} />}
      </div>
    </div>
  );
}

export default App;