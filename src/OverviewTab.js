import React, { useState, useEffect, useRef } from "react";
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

function OverviewTab() {
    const MAX_RESOLUTION = 2000;
    const MIN_SCALE = 1;

    const savedScale = parseInt(localStorage.getItem("gymFloorScale")) || 25;

    const [imageUrl, setImageUrl] = useState("");
    const [scale, setScale] = useState(savedScale);
    const [showResolutionBar, setShowResolutionBar] = useState(false);
    const previousImageDataRef = useRef(null);

    const fetchImage = (scalePercent) => {
        const effectiveScale = Math.max(scalePercent, MIN_SCALE);
        const resolution = Math.round((effectiveScale / 100) * MAX_RESOLUTION);

        return fetch(`${API_BASE_URL}/api/gym-floor?width=${resolution}&height=${resolution}`)
            .then((res) => res.blob())
            .then((blob) => {
                return new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const base64data = reader.result;
                        resolve({ blob, base64data });
                    };
                    reader.readAsDataURL(blob);
                });
            })
            .catch((error) => {
                console.error(error);
                return null;
            });
    };

    useEffect(() => {
        // Initial fetch
        fetchImage(savedScale).then((result) => {
            if (result) {
                previousImageDataRef.current = result.base64data;
                setImageUrl(URL.createObjectURL(result.blob));
            }
        });

        // Polling every 5 seconds
        const intervalId = setInterval(() => {
            fetchImage(scale).then((result) => {
                if (result && result.base64data !== previousImageDataRef.current) {
                    previousImageDataRef.current = result.base64data;
                    setImageUrl(URL.createObjectURL(result.blob));
                }
            });
        }, 5000);

        return () => clearInterval(intervalId);
        // eslint-disable-next-line
    }, []);

    function handleApply() {
        const effectiveScale = Math.max(scale, MIN_SCALE);
        localStorage.setItem("gymFloorScale", effectiveScale);
        fetchImage(effectiveScale).then((result) => {
            if (result) {
                previousImageDataRef.current = result.base64data;
                setImageUrl(URL.createObjectURL(result.blob));
            }
        });
    }

    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const windowHeight = window.innerHeight;
            const fullHeight = document.documentElement.scrollHeight;

            if (!showResolutionBar && scrollTop + windowHeight >= fullHeight * 0.8) {
                setShowResolutionBar(true);
            }
        };

        window.addEventListener("scroll", handleScroll);
        handleScroll();

        return () => window.removeEventListener("scroll", handleScroll);
    }, [showResolutionBar]);

    return (
        <div className="overview" style={{ textAlign: 'center' }}>
            {imageUrl ? (
                <img
                    src={imageUrl}
                    alt="Gym floor"
                    style={{
                        width: "600px",
                        height: "600px",
                        objectFit: "contain",
                        backgroundColor: "#f5f5f5", // matches light page background
                        borderRadius: "12px",
                        boxShadow: "0 8px 20px rgba(0, 0, 0, 0.15)",
                        transition: "all 0.3s ease",
                    }}
                />
            ) : (
                <p>Loading image...</p>
            )}

            {showResolutionBar && (
                <div
                    className="resolution-bar"
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: '10px',
                        maxWidth: '600px',
                        marginLeft: 'auto',
                        marginRight: 'auto'
                    }}
                >
                    <label style={{ flexGrow: 1, marginRight: '20px' }}>
                        Resolution: {Math.max(scale, MIN_SCALE)}%
                        <input
                            type="range"
                            min={MIN_SCALE}
                            max="100"
                            value={scale}
                            onChange={(e) => setScale(Number(e.target.value))}
                            style={{ width: '100%' }}
                        />
                    </label>
                    <button
                        onClick={handleApply}
                        className="apply-btn"
                        style={{
                            padding: '10px 20px',
                            backgroundColor: '#4caf50',
                            color: '#fff',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontWeight: 'bold',
                            boxShadow: "0 4px 12px rgba(0,0,0,0.2)", // subtle button shadow
                            transition: "all 0.3s ease",
                        }}
                    >
                        Apply
                    </button>
                </div>
            )}
        </div>
    );
}

export default OverviewTab;