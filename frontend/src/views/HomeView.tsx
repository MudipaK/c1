
import React from "react";
import { useNavigate } from "react-router-dom";
import NavBar from "../components/Navbar/NavBar";
import AboutUs from "../components/About/AboutUs";
import "../App.css";
import '@fontsource/poppins/700.css'; // Optional: bold weights
import Footer from "../components/Footer/Footer";

const HomeView: React.FC = () => {

  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/events");
  }


  return (


    <>
      <NavBar />


      {/* Background Animation */}
      <div className="area">
        <ul className="circles">
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
          <li></li>
        </ul>
      </div>

      <div className="wave">
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
        <h1 className="hover:animate-bounce font-poppins mb-6 flex  space-x-1 rounded px-4 py-2 text-7xl font-bold tracking-wide text-white" >Event Link</h1>





        <p className="font-poppins text-xl text-amber-300 mb-8 max-w-2xl">
          Welcome fellows!
          Link with us to explore events and clubs happening around you.
          Organize your events and manage your clubs with ease.
        </p>





        <button
          onClick={handleLoginClick}
          className="bg-blur font-poppins text-black-800 hover:text-white-900 transform-gpu cursor-pointer rounded-3xl border border-white-500 bg-gradient-to-r px-8 py-4 font-bold text-white backdrop-blur-md transition-transform hover:-translate-y-1 hover:border-0 hover:from-amber-500 hover:to-amber-300 hover:text-blue-950 hover:shadow-lg">GET STARTED !</button>




      </div>

<section id="AboutUs">
      <AboutUs />
      </section>

      <Footer />



    </>



  );


};

export default HomeView;
