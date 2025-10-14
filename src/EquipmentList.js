// EquipmentList.js
import React, { useEffect, useState, useRef } from "react";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function EquipmentList({ darkMode }) {
    const [equipmentData, setEquipmentData] = useState([]);
    const [peopleCount, setPeopleCount] = useState(0);
    const equipmentDataRef = useRef(null);

    useEffect(() => {
        const fetchEquipment = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/equipment`);
                const data = await res.json();
                const newDataString = JSON.stringify(data);
                if (equipmentDataRef.current !== newDataString) {
                    equipmentDataRef.current = newDataString;
                    setEquipmentData(data);
                }
            } catch (err) {
                console.error(err);
            }
        };

        const fetchPeopleCount = async () => {
            try {
                const res = await fetch(`${API_BASE_URL}/api/gym-count`);
                const data = await res.json();
                setPeopleCount(data.people_in_gym);
            } catch (err) {
                console.error(err);
            }
        };

        fetchEquipment();
        fetchPeopleCount();
        const equipmentIntervalId = setInterval(fetchEquipment, 5000);
        const peopleCountIntervalId = setInterval(fetchPeopleCount, 5000);
        return () => {
            clearInterval(equipmentIntervalId);
            clearInterval(peopleCountIntervalId);
        };
    }, []);

    const renderTable = (section) => {
        const filteredData = equipmentData.filter((item) => item.section === section);

        return (
            <div className={`equipment-section ${darkMode ? "dark" : "light"}`}>
                <h2>{section} Equipment</h2>
                <div className="equipment-cards">
                    {filteredData.map((item, index) => (
                        <div key={index} className={`equipment-card ${darkMode ? "dark" : "light"}`}>
                            <span className="equipment-name">{item.name}</span>
                            <span
                                className="equipment-status"
                                style={{
                                    color: item.available > 0 ? "#4caf50" : "#f44336",
                                    fontWeight: "bold",
                                }}
                            >
                                {item.available}/{item.total} available
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <div className={`equipment-list-container ${darkMode ? "dark" : "light"}`}>
            {renderTable("Cardio")}
            {renderTable("Weight")}
            <h2 className="people-count">People in Gym: {peopleCount}</h2>
        </div>
    );
}

export default EquipmentList;