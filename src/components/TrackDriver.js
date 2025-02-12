import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default Leaflet icon not showing
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const TrackDriver = () => {
  const [driverLocations, setDriverLocations] = useState({});
  const mapRef = useRef(null); // Reference for the map
  const markersRef = useRef({}); // Reference for markers (one per driver)

  useEffect(() => {
    // Check if map container exists
    const mapContainer = document.getElementById("map");
    if (!mapContainer) {
      console.error("Map container not found!");
      return;
    }

    // Set default Leaflet icon
    const DefaultIcon = L.icon({
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });
    L.Marker.prototype.options.icon = DefaultIcon;

    // Initialize map if not already initialized
    if (!mapRef.current) {
      mapRef.current = L.map("map").setView([0, 0], 10); // Default view
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "OpenStreetMap contributors",
      }).addTo(mapRef.current);
    }

    // Connect to WebSocket server
    const socket = io("https://web-socket-production-5866.up.railway.app/");

    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    // Listen for driver location updates
    socket.on("receive-location", (locations) => {
      console.log("Updated Driver Locations:", locations);
      setDriverLocations(locations);
    });

    // Clean up WebSocket connection on component unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    Object.entries(driverLocations).forEach(([id, { latitude, longitude }]) => {
      if (isNaN(latitude) || isNaN(longitude)) {
        console.error(
          `Invalid coordinates for driver ${id}:`,
          latitude,
          longitude
        );
        return;
      }

      if (markersRef.current[id]) {
        // Update existing marker position
        markersRef.current[id].setLatLng([latitude, longitude]);
      } else {
        // Create a new marker for this driver
        markersRef.current[id] = L.marker([latitude, longitude], {
          title: `Driver ID: ${id}`,
        }).addTo(mapRef.current);
      }
    });

    // Center the map on the last updated driver
    const latestDriver = Object.entries(driverLocations).pop();
    if (latestDriver) {
      const [, { latitude, longitude }] = latestDriver;
      mapRef.current.setView([latitude, longitude], 16);
    }
  }, [driverLocations]);
  const sendTwilioMessage = async () => {
    try {
      const response = await fetch("http://localhost:5000/send-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          link: "https://admin-app-psi-five.vercel.app/td",
        }),
      });
      const data = await response.json();
      if (data.success) {
        console.log("Message sent successfully:", data.messageSid);
      } else {
        console.error("Error sending message:", data.error);
      }
    } catch (error) {
      console.error("Network error:", error);
    }
  };

  return (
    <div style={{ padding: "20px", fontSize: "18px" }}>
      <h2>Driver Live Location Updates</h2>
      {Object.keys(driverLocations).length === 0 ? (
        <p>No drivers currently online.</p>
      ) : (
        <ul>
          {Object.entries(driverLocations).map(
            ([id, { latitude, longitude }]) => (
              <li key={id}>
                <strong>Driver ID:</strong> {id} <br />
                <strong>Latitude:</strong> {latitude} <br />
                <strong>Longitude:</strong> {longitude}
              </li>
            )
          )}
        </ul>
      )}
      {/* Twilio Button Positioned Correctly */}
      <div style={{ textAlign: "center", margin: "20px 0" }}>
        <button
          onClick={sendTwilioMessage}
          style={{ padding: "10px 20px", fontSize: "16px" }}
        >
          Send WhatsApp Notification
        </button>
      </div>

      {/* Map container */}
      <div
        id="map"
        style={{ height: "60vh", width: "100%", marginTop: "20px" }}
      />
    </div>
  );
};

export default TrackDriver;
