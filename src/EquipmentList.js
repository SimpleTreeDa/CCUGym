// EquipmentList.js
import React, { useEffect, useState } from "react";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function EquipmentList() {
    const [equipmentData, setEquipmentData] = useState([]);
    const [peopleCount, setPeopleCount] = useState(0);

    useEffect(() => {
        // Fetch equipment data
        fetch(`${API_BASE_URL}/api/equipment`)
            .then((res) => res.json())
            .then((data) => setEquipmentData(data))
            .catch(console.error);

        // Fetch gym people count
        const fetchPeopleCount = () => {
            fetch(`${API_BASE_URL}/api/gym-count`)
                .then((res) => res.json())
                .then((data) => setPeopleCount(data.people_in_gym))
                .catch(console.error);
        };

        fetchPeopleCount();
        const intervalId = setInterval(fetchPeopleCount, 5000); // refresh every 5s
        return () => clearInterval(intervalId);
    }, []);

    return (
        <div>
           

            <h2>Cardio Equipment</h2>
            <table>
                <thead>
                    <tr>
                        <th>Equipment</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {equipmentData
                        .filter((item) => item.section === "Cardio")
                        .map((item, index) => (
                            <tr key={index}>
                                <td>{item.name}</td>
                                <td style={{ color: item.available > 0 ? "green" : "red" }}>
                                    {item.available}/{item.total} available
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>

            <h2>Weight Equipment</h2>
            <table>
                <thead>
                    <tr>
                        <th>Equipment</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    {equipmentData
                        .filter((item) => item.section === "Weight")
                        .map((item, index) => (
                            <tr key={index}>
                                <td>{item.name}</td>
                                <td style={{ color: item.available > 0 ? "green" : "red" }}>
                                    {item.available}/{item.total} available
                                </td>
                            </tr>
                        ))}
                </tbody>
            </table>
            <h2>People in Gym: {peopleCount}</h2>
        </div>
    );
}

export default EquipmentList;