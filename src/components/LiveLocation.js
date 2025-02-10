import React, { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { io } from "socket.io-client";

const LiveLocation = () => {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const socket = useRef(null);

  useEffect(() => {
    // Connect to the backend WebSocket server
    socket.current = io("http://localhost:5000"); // Change URL if backend is hosted remotely

    // Initialize Leaflet Map
    if (!mapRef.current) {
      mapRef.current = L.map("map").setView([0, 0], 16);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(
        mapRef.current
      );
    }

    // Get Driver's Location
    if (navigator.geolocation) {
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          console.log("Driver's Location:", latitude, longitude);

          // Update or Create Marker
          if (markerRef.current) {
            markerRef.current.setLatLng([latitude, longitude]);
          } else {
            markerRef.current = L.marker([latitude, longitude]).addTo(
              mapRef.current
            );
          }

          // Center the map
          mapRef.current.setView([latitude, longitude], 16);

          // Send coordinates to the backend server
          socket.current.emit("send-location", { latitude, longitude });
        },
        (error) => console.error("Geolocation Error:", error),
        { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );

      return () => {
        navigator.geolocation.clearWatch(watchId);
        socket.current.disconnect();
      };
    }
  }, []);

  return <div id="map" style={{ height: "100vh", width: "100%" }} />;
};

export default LiveLocation;
