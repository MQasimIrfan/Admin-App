import React from 'react'
import Carousal from '../components/carousal'
import Rentcar from "../components/rentcar";
import Card from "../components/CarServices";
import CarBook from '../components/CarBook';
import Mapimage from '../components/Mapimage';
import LiveLoc from "../components/LiveLocation";
import Td from "../components/TrackDriver"
const Home = () => {
  return (
    <div>
        
        <Carousal />
        <h1 style={{ textAlign: 'center' }}>Project Title</h1>
        <Rentcar/>
        <Card/>
        <CarBook/>
        <Mapimage/>
        <LiveLoc />
        <Td />
    </div>
  )
}

export default Home