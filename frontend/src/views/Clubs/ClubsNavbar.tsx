import React from "react";
import { useNavigate } from "react-router-dom";
import logo from "/assets/logo.png";



const ClubsNavbar: React.FC = () => {
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate("/login");
  };

  return (
    <nav className="fixed  top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-4 backdrop-blur-md shadow-md">
      {/* Logo */}
      <div className="flex items-center">
        <a href="/" aria-label="Home">
          <img src={logo} className="mx-2" width={50} height={33} alt="Logo" />
        </a>
      </div>

      {/* Menu and Login */}
      <div className="flex items-center gap-8 font-poppins">
        <ul className="flex gap-6 text-lg font-medium text-[#100944]">
        <a href="/#AboutUs" className="hover:text-[#fcd7be] transition">About Us</a>
        <li><a href="/events" className="hover:text-[#fcd7be] transition">Events</a></li>
          <li><a href="/clubs" className="text-[#ffffff] transition">Clubs & Societies</a></li>
        </ul>

        
        


        <button
          onClick={handleLoginClick}
          className="bg-[#100944] text-white hover:bg-[#069efd] cursor-pointer hover:text-white px-5 py-2 rounded-md transition duration-300 ease-in-out transform hover:scale-105"
        >
          Login
        </button>
      </div>
    </nav>
  );
};

export default ClubsNavbar;
