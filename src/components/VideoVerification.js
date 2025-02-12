import React, { useEffect, useRef, useState } from "react";
import io from "socket.io-client";
import SimplePeer from "simple-peer";

const socket = io(
  "https://backend-videoverification-production.up.railway.app/"
);

const VideoVerification = ({ adminId, driverId }) => {
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null); // Ensure ref is initialized
  const peerRef = useRef(null);

  useEffect(() => {
    console.log(`📡 Admin ${adminId} requesting video from Driver ${driverId}`);
    socket.emit("request_video", { adminId, driverId });

    socket.on("receive_offer", async ({ signal, driverSocket }) => {
      if (peerRef.current) {
        console.warn("⚠️ Destroying previous peer connection.");
        peerRef.current.destroy();
        peerRef.current = null;
      }

      try {
        console.log("🎥 Requesting camera & microphone access...");
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        peerRef.current = new SimplePeer({
          initiator: false,
          trickle: false,
          stream: mediaStream,
        });

        peerRef.current.on("signal", (answerSignal) => {
          console.log("📨 Sending answer to driver:", answerSignal);
          socket.emit("send_answer", { signal: answerSignal, driverSocket });
        });

        peerRef.current.on("stream", (driverStream) => {
          console.log("✅ Receiving driver stream:", driverStream);

          // 🛠️ Ensure the video element is available before setting the stream
          setStream(driverStream);
        });

        peerRef.current.on("error", (err) => {
          console.error("❌ Peer connection error:", err);
        });

        peerRef.current.on("close", () => {
          console.log("🔄 Peer connection closed. Cleaning up...");
          if (peerRef.current) {
            peerRef.current.destroy();
            peerRef.current = null;
          }
        });

        peerRef.current.signal(signal);
      } catch (error) {
        console.error("🚨 Error accessing media devices:", error);
      }
    });

    return () => {
      socket.off("receive_offer");
      if (peerRef.current) {
        peerRef.current.destroy();
        peerRef.current = null;
      }
    };
  }, [adminId, driverId]);

  // 🔹 Use another useEffect to assign the stream once the video element is ready
  useEffect(() => {
    if (stream && videoRef.current) {
      console.log("🎥 Setting stream to video element...");
      videoRef.current.srcObject = stream;
      videoRef.current
        .play()
        .catch((err) => console.error("🚨 Video play error:", err));
    }
  }, [stream]); // Runs when stream is updated

  return (
    <div>
      <h2>Admin Live View</h2>
      <video ref={videoRef} autoPlay playsInline muted></video>
    </div>
  );
};

export default VideoVerification;
