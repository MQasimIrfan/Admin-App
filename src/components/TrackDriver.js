import React, { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet default icon issue
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

const TrackDriver = () => {
  const [driverLocations, setDriverLocations] = useState({});
  const [isLive, setIsLive] = useState(false); // Track if location is live
  const mapRef = useRef(null);
  const markersRef = useRef({});

  useEffect(() => {
    const mapContainer = document.getElementById("map");
    if (!mapContainer) {
      console.error("Map container not found!");
      return;
    }

    const DefaultIcon = L.icon({
      iconUrl: markerIcon,
      shadowUrl: markerShadow,
      iconSize: [25, 41],
      iconAnchor: [12, 41],
    });
    L.Marker.prototype.options.icon = DefaultIcon;

    if (!mapRef.current) {
      mapRef.current = L.map("map").setView([31.464373, 74.32351], 16); // Default location
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "OpenStreetMap contributors",
      }).addTo(mapRef.current);
    }

    const socket = io("https://web-socket-production-5866.up.railway.app/");

    socket.on("connect", () => {
      console.log("Connected to WebSocket server");
    });

    socket.on("receive-location", (locations) => {
      if (Object.keys(locations).length > 0) {
        console.log("Live Driver Locations:", locations);
        setDriverLocations(locations);
        setIsLive(true); // Confirm location is live
        sessionStorage.setItem("driverLocations", JSON.stringify(locations));
      } else {
        setIsLive(false); // No live drivers
      }
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from WebSocket server.");
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current) return;

    let locationsToShow = driverLocations;

    if (Object.keys(driverLocations).length === 0) {
      const savedLocations = sessionStorage.getItem("driverLocations");
      if (savedLocations) {
        try {
          locationsToShow = JSON.parse(savedLocations);
          setDriverLocations(locationsToShow);
          setIsLive(false); // Using last known location
        } catch (error) {
          console.error("Error parsing stored locations:", error);
        }
      }
    }

    Object.entries(locationsToShow).forEach(([id, { latitude, longitude }]) => {
      if (isNaN(latitude) || isNaN(longitude)) {
        console.error(Invalid coordinates for driver ${id}:, latitude, longitude);
        return;
      }

      if (markersRef.current[id]) {
        markersRef.current[id].setLatLng([latitude, longitude]);
      } else {
        markersRef.current[id] = L.marker([latitude, longitude], {
          title: Driver ID: ${id},
        }).addTo(mapRef.current);
      }
    });

    const latestDriver = Object.entries(locationsToShow).pop();
    if (latestDriver) {
      const [, { latitude, longitude }] = latestDriver;
      mapRef.current.setView([latitude, longitude], 16);
    }
  }, [driverLocations]);

  return (
    <div style={{ padding: "20px", fontSize: "18px" }}>
      <h2>Driver Live Location Updates</h2>
      
      {Object.keys(driverLocations).length === 0 ? (
        <p>No drivers currently online. <strong>Showing last known location.</strong></p>
      ) : isLive ? (
        <p>✅ <strong>Live driver locations</strong> are being displayed.</p>
      ) : (
        <p>⚠ No live drivers. <strong>Displaying last known location.</strong></p>
      )}

      <ul>
        {Object.entries(driverLocations).map(([id, { latitude, longitude }]) => (
          <li key={id}>
            <strong>Driver ID:</strong> {id} <br />
            <strong>Latitude:</strong> {latitude} <br />
            <strong>Longitude:</strong> {longitude} <br />
            {isLive ? "🟢 Live Location" : "🟡 Last Known Location"}
          </li>
        ))}
      </ul>

      <div id="map" style={{ height: "60vh", width: "100%", marginTop: "20px" }} />
    </div>
  );
};

export default TrackDriver;
