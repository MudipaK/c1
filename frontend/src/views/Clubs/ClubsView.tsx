import React from "react";
import ClubsNavbar from "./ClubsNavbar";
import "./clubs.css"
import Footer from "../../components/Footer/Footer";



const ClubsView: React.FC = () => {

    return (

        <div id="clubs">
          <ClubsNavbar /> 


        <div className="areaEvent">
        <ul className="circlesEvent">
          <li className="circle-event-li"></li>
          <li className="circle-event-li"></li>
          <li className="circle-event-li"></li>
          <li className="circle-event-li"></li>
          <li className="circle-event-li"></li>
          <li className="circle-event-li"></li>
          <li className="circle-event-li"></li>
          <li className="circle-event-li"></li>
          <li className="circle-event-li"></li>
          <li className="circle-event-li"></li>
        </ul>
      </div>

      <div className="waveEvent">
        <svg
          viewBox="0 0 1440 320"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill="#ffffff"
            fillOpacity="1"
            d="M0,224L60,197.3C120,171,240,117,360,101.3C480,85,600,107,720,138.7C840,171,960,213,1080,197.3C1200,181,1320,107,1380,69.3L1440,32L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
          />
        </svg>
      </div>



      <div className="relative z-10 flex h-screen flex-col items-center justify-center px-4 text-center ">
        <h1 className="animate-bounce font-poppins mb-6 flex  space-x-1 rounded px-4 py-2 text-7xl font-bold tracking-wide text-white" > Clubs & Societies </h1>





        </div>

        <Footer />

        </div>

    );

};

export default ClubsView;