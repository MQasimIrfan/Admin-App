import React from "react";
import Navbar from "./components/navbar";
import { Route, Routes } from "react-router-dom";

import Footer from "./components/footer";
import Verfication from "./components/Verification";
import About from "./Pages/About";
import Home from "./Pages/Home";
import Location from "./Pages/Location";
import DeepFace from "./Pages/DeepFace";   
import Login from "./Pages/Login";
import Signup from "./Pages/Signup";
import LiveLoc from "./components/LiveLocation"
import Td from "./components/TrackDriver";
import VV from "./components/VideoVerification";
function App() {
    return (
      <div>
        <Navbar />
        <Routes>
          {/* <Route path="/" element={<Home />} /> */}
          <Route path="/about" element={<About />} />
          <Route path="/location" element={<Location />} />
          <Route path="/deepface" element={<DeepFace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verfication" element={<Verfication />} />
          <Route path="/livelocation" element={<LiveLoc />} />
          <Route path="/td" element={<Td />} />
          {/* <Route path="/vv" element={<VV />} /> */}
          <Route
            path="/admin/video"
            element={
              <VV adminId="admin123" driverId="driver123" />
            }
          />
        </Routes>

        <Footer />
      </div>
    );
}

export default App;
