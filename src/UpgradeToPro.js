import React, { useState } from "react";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const UpgradeToPro = ({ darkMode }) => {
    const [proCode, setProCode] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const handleApplyClick = async (e) => {
        e.preventDefault();

        if (!proCode) {
            setStatusMessage("❌ Please enter a Pro code.");
            return;
        }

        setLoading(true);
        setStatusMessage("");

        try {
            const res = await fetch(`${API_BASE_URL}/api/pro/upgrade`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: proCode.trim().toUpperCase() })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                localStorage.setItem("proToken", data.token);
                setStatusMessage("✅ Pro code applied successfully! You are now a Pro for 2 hours.");

                // Reload page to refresh tabs
                setTimeout(() => window.location.reload(), 500);
            } else {
                setStatusMessage(`❌ ${data.error || "Invalid Pro code"}`);
            }
        } catch (err) {
            console.error(err);
            setStatusMessage("❌ Error applying Pro code. Try again later.");
        } finally {
            setLoading(false);
        }
    };

    // Styles that change based on darkMode
    const containerStyle = {
        padding: "20px",
        fontFamily: "Arial, sans-serif",
        maxWidth: "400px",
        margin: "0 auto",
        textAlign: "center",
        borderRadius: "8px",
        backgroundColor: darkMode ? "#222" : "#fff",
        color: darkMode ? "#fff" : "#000",
        boxShadow: darkMode
            ? "0 0 10px rgba(255,255,255,0.1)"
            : "0 0 10px rgba(0,0,0,0.1)",
    };

    const inputStyle = {
        width: "98%",
        padding: "10px",
        fontSize: "16px",
        borderRadius: "4px",
        border: `1px solid ${darkMode ? "#555" : "#ccc"}`,
        backgroundColor: darkMode ? "#333" : "#fff",
        color: darkMode ? "#fff" : "#000",
        textAlign: "center",
    };

    const buttonStyle = {
        marginTop: "15px",
        padding: "10px 20px",
        fontSize: "16px",
        borderRadius: "5px",
        backgroundColor: "#4caf50",
        color: "#fff",
        border: "none",
        cursor: loading ? "not-allowed" : "pointer",
    };

    return (
        <div style={containerStyle}>
            <h2>Upgrade to Pro</h2>
            <p>Enter your Pro code below to unlock premium features:</p>

            <form onSubmit={handleApplyClick}>
                <input
                    type="text"
                    value={proCode}
                    onChange={(e) => setProCode(e.target.value)}
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    maxLength={19}
                    style={inputStyle}
                />
                <button type="submit" disabled={loading} style={buttonStyle}>
                    {loading ? "Applying..." : "Apply"}
                </button>
            </form>

            {statusMessage && (
                <p style={{ marginTop: "15px", fontSize: "14px" }}>{statusMessage}</p>
            )}
        </div>
    );
};

export default UpgradeToPro;