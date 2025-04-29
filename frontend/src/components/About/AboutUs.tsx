import React from 'react';
//import "./AboutUs.css";



const AboutUs: React.FC = () => {
    return (
        <>

            {/* Background Animation */}
            <div className="areaAbout">
                <ul className="circlesAbout">
                    <li className="about-circle-item"></li>
                    <li className="about-circle-item"></li>
                    <li className="about-circle-item"></li>
                    <li className="about-circle-item"></li>
                    <li className="about-circle-item"></li>
                    <li className="about-circle-item"></li>
                    <li className="about-circle-item"></li>
                    <li className="about-circle-item"></li>
                    <li className="about-circle-item"></li>
                    <li className="about-circle-item"></li>
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





            <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 items-center gap-8">
                    <div className="max-w-lg">
                        <h2 className="text-3xl font-extrabold text-[#FC8239] sm:text-4xl hover:text-[#069efd]">About Us</h2>
                        <p className="mt-4 text-gray-600 text-lg">
                            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed quis eros at lacus feugiat
                            hendrerit sed ut tortor. Suspendisse et magna quis elit efficitur consequat. Mauris eleifend
                            velit a pretium iaculis. Donec sagittis velit et magna euismod, vel aliquet nulla malesuada.
                            Nunc pharetra massa lectus, a fermentum arcu volutpat vel.
                        </p>
                        <div className="mt-8">
                            <a href="/clubs" className="text-[#FC8239] hover:text-[#069efd] font-medium ">
                                Explore clubs <span className="ml-2">&#8594;</span>
                            </a>
                        </div>
                    </div>
                    <div className="mt-12 md:mt-0">
                        <img
                            src="https://images.unsplash.com/photo-1531973576160-7125cd663d86"
                            alt="About Us Image"
                            className="object-cover rounded-lg shadow-md"
                        />
                    </div>
                </div>
            </div>

        </>
    );
};

export default AboutUs;
