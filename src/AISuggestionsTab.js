import React, { useState, useEffect } from "react";

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

const AISuggestionsTab = ({ darkMode }) => {
    const [prompt, setPrompt] = useState("");
    const [placeholder, setPlaceholder] = useState("What equipment is currently available?");
    const [suggestion, setSuggestion] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Function to query AI
    const fetchAISuggestion = async (userPrompt) => {
        setLoading(true);
        setError("");
        setSuggestion("");

        try {
            const token = localStorage.getItem("proToken");
            const res = await fetch(`${API_BASE_URL}/api/ai-suggestions`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({ prompt: userPrompt }),
            });

            const data = await res.json();
            if (res.ok) {
                setSuggestion(data.suggestion);
            } else {
                setError(data.error || "Failed to get suggestion.");
            }
        } catch (err) {
            console.error(err);
            setError("Error communicating with AI server.");
        } finally {
            setLoading(false);
        }
    };

    // Automatically ask AI on load
    useEffect(() => {
        const loadInitialSuggestion = async () => {
            const token = localStorage.getItem("proToken");
            if (!token) return; // Skip if no token

            await fetchAISuggestion(placeholder);
        };

        loadInitialSuggestion();
    }, [placeholder]);

    // Handle user input submission
    const handleSubmit = () => {
        if (!prompt) {
            setError("Please enter a prompt.");
            return;
        }
        setPlaceholder(prompt);
        fetchAISuggestion(prompt);
        setPrompt("");
    };

    // Styles depending on darkMode
    const containerStyle = {
        padding: "20px",
        maxWidth: "600px",
        margin: "0 auto",
        backgroundColor: darkMode ? "#222" : "#fff",
        color: darkMode ? "#fff" : "#000",
        borderRadius: "8px",
        boxShadow: darkMode
            ? "0 0 10px rgba(255, 255, 255, 0.1)"
            : "0 0 10px rgba(0, 0, 0, 0.1)",
    };

    const textareaStyle = {
        width: "98%",
        padding: "10px",
        fontSize: "16px",
        marginTop: "10px",
        color: darkMode ? "#fff" : "#000",
        backgroundColor: darkMode ? "#333" : "#fff",
        border: `1px solid ${darkMode ? "#555" : "#ccc"}`,
        borderRadius: "5px",
    };

    const suggestionStyle = {
        marginTop: "15px",
        padding: "10px",
        border: `1px solid ${darkMode ? "#555" : "#ccc"}`,
        borderRadius: "5px",
        backgroundColor: darkMode ? "#333" : "#f9f9f9",
        color: darkMode ? "#fff" : "#000",
    };

    const buttonStyle = {
        marginTop: "10px",
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
            <h2>AI Suggestions</h2>

            <textarea
                onKeyDown={(e) => {
                    if (e.key === "Enter") {
                        e.preventDefault();
                        handleSubmit();
                    }
                }}
                rows={4}
                placeholder={placeholder}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                style={textareaStyle}
            />

            <button onClick={handleSubmit} disabled={loading} style={buttonStyle}>
                {loading ? "Generating..." : "Get Suggestion"}
            </button>

            {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}
            {loading && (
                <p style={{ color: darkMode ? "#bbb" : "#777", marginTop: "10px", fontStyle: "italic" }}>
                    Thinking...
                </p>
            )}
            {!loading && suggestion && <div style={suggestionStyle}>{suggestion}</div>}
        </div>
    );
};

export default AISuggestionsTab;