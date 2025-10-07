import React, { useState, useEffect } from "react";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function OverviewTab() {
  const [imageUrl, setImageUrl] = useState("");

  useEffect(() => {
    // Fetch gym image from backend
      fetch(`${API_BASE_URL}/api/gym-floor`)
      .then((res) => res.blob())
      .then((blob) => {
        setImageUrl(URL.createObjectURL(blob));
      })
      .catch(console.error);
  }, []);

  return (
    <div className="overview">
      {imageUrl ? (
        <img
          src={imageUrl}
          alt="Gym floor"
          style={{ maxWidth: "100%", height: "auto" }}
        />
      ) : (
        <p>Loading image...</p>
      )}
    </div>
  );
}

export default OverviewTab;