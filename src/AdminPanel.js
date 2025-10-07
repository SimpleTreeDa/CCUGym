import React, { useEffect, useState } from "react";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function AdminPanel({ darkMode }) {
    const [equipmentData, setEquipmentData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState("");
    const [password, setPassword] = useState("");
    const [authorized, setAuthorized] = useState(false);
    const [adminToken, setAdminToken] = useState("");
    const [updating, setUpdating] = useState(false);
    const [applyingAll, setApplyingAll] = useState(false);

    // Update panelClass dynamically
    const panelClass = darkMode ? "admin-panel dark" : "admin-panel light";

    useEffect(() => {
        const validateAdminToken = async () => {
            const token = localStorage.getItem("adminToken");
            if (!token) return;
            try {
                const res = await fetch(`${API_BASE_URL}/api/validate-token`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ token }),
                });
                const data = await res.json();
                if (res.ok && data.valid && data.user_id === "admin_user") {
                    setAdminToken(token);
                    setAuthorized(true);
                } else {
                    localStorage.removeItem("adminToken");
                    setAuthorized(false);
                }
            } catch {
                localStorage.removeItem("adminToken");
                setAuthorized(false);
            }
        };
        validateAdminToken();
    }, []);

    useEffect(() => {
        if (adminToken) localStorage.setItem("adminToken", adminToken);
        else localStorage.removeItem("adminToken");
    }, [adminToken]);

    const fetchEquipment = async (token) => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/equipment`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("Unauthorized");
            const data = await res.json();
            setEquipmentData(data);
            setLoading(false);
        } catch (err) {
            setMessage("Error fetching data or unauthorized. Admin access required.");
            setLoading(false);
        }
    };

    useEffect(() => {
        if (authorized && adminToken) fetchEquipment(adminToken);
    }, [authorized, adminToken]);

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        setMessage("Verifying password...");
        try {
            const res = await fetch(`${API_BASE_URL}/api/admin/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ password }),
            });
            const data = await res.json();
            if (res.ok && data.token) {
                setAdminToken(data.token);
                setAuthorized(true);
                setMessage("✅ Access granted!");
            } else {
                setMessage("❌ Incorrect password, please try again.");
            }
        } catch {
            setMessage("❌ Error during login, please try again.");
        }
    };

    const handleChange = (index, field, value) => {
        const newData = [...equipmentData];
        newData[index][field] = Number(value);
        setEquipmentData(newData);
    };

    const handleUpdate = async (item) => {
        setUpdating(true);
        setMessage(`Updating ${item.name}...`);
        try {
            const res = await fetch(`${API_BASE_URL}/api/equipment/update`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${adminToken}`,
                },
                body: JSON.stringify({
                    name: item.name,
                    total: item.total,
                    available: item.available,
                }),
            });
            const data = await res.json();
            if (res.ok) setMessage(`✅ ${item.name} updated successfully`);
            else setMessage(`⚠️ Error: ${data.error}`);
        } catch {
            setMessage(`⚠️ Error updating ${item.name}`);
        } finally {
            setUpdating(false);
        }
    };

    const handleApplyAll = async () => {
        setApplyingAll(true);
        setMessage("Applying all updates...");
        for (const item of equipmentData) {
            await handleUpdate(item);
        }
        setMessage("✅ All updates applied successfully!");
        setApplyingAll(false);
    };

    // AUTHENTICATION
    if (!authorized) {
        return (
            <div className={panelClass} style={{ padding: "20px", margin: "40px auto", maxWidth: "500px", borderRadius: "8px", textAlign: "center" }}>
                <h2>Admin Panel - Password Required</h2>
                {message && <p>{message}</p>}
                <form onSubmit={handlePasswordSubmit}>
                    <input
                        type="password"
                        placeholder="Enter password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button type="submit">Enter</button>
                </form>
            </div>
        );
    }

    if (loading) return <p style={{ textAlign: "center" }}>Loading equipment...</p>;

    // MAIN PANEL
    return (
        <div className={panelClass} style={{ padding: "20px", margin: "40px auto", maxWidth: "800px", borderRadius: "8px" }}>
            <h2>Admin Panel - Update Gym Equipment</h2>
            {message && <p style={{ color: applyingAll ? "#555" : "#008000" }}>{message}</p>}

            <button onClick={handleApplyAll} disabled={updating || applyingAll} style={{ marginBottom: "10px" }}>
                {applyingAll ? "Applying..." : "Apply All"}
            </button>

            <table style={{ borderCollapse: "collapse", width: "100%", marginTop: "10px" }}>
                <thead>
                    <tr>
                        <th>Equipment</th>
                        <th>Section</th>
                        <th>Total</th>
                        <th>Available</th>
                        <th>Action</th>
                    </tr>
                </thead>
                <tbody>
                    {equipmentData.map((item, i) => (
                        <tr key={i}>
                            <td>{item.name}</td>
                            <td>{item.section}</td>
                            <td>
                                <input type="number" value={item.total} onChange={(e) => handleChange(i, "total", e.target.value)} min="0" />
                            </td>
                            <td>
                                <input type="number" value={item.available} onChange={(e) => handleChange(i, "available", e.target.value)} min="0" max={item.total} />
                            </td>
                            <td>
                                <button onClick={() => handleUpdate(item)} disabled={updating || applyingAll}>Update</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

export default AdminPanel;