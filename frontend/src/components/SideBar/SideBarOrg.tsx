import React, { useState, useEffect } from 'react';
import './Sidebar.css';
import logo from '/assets/logo.png';
import { useNavigate } from 'react-router-dom';
import EventOrg from '../../views/EventOrg';
import Profile from '../../views/Profile/Profile';
import Committee from '../../views/Committee/Committee';
import Resources from '../../views/Resources/Resources';
import Calendar from '../../views/Calendar/Calendar';



const SideBarOrg: React.FC = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const navigate = useNavigate();
    const [isBouncing, setIsBouncing] = useState(true);


    useEffect(() => {

        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.documentElement.classList.add('dark');
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => setIsBouncing(false), 3500); // stop after 3s
        return () => clearTimeout(timer);
    }, []);

    const handleLogout = () => {
        // Perform logout logic here
        navigate('/');
    };

    const navItems = [
        {
            label: 'Profile',
            href: '/organizer/profile',
            component: <Profile />,
            iconPath:
                'M17.982 18.725A7.488 7.488 0 0 0 12 15.75a7.488 7.488 0 0 0-5.982 2.975m11.963 0a9 9 0 1 0-11.963 0m11.963 0A8.966 8.966 0 0 1 12 21a8.966 8.966 0 0 1-5.982-2.275M15 9.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z',
        },
        {
            label: 'Events',
            href: '/organizer/eventsAdmin',
            component: <EventOrg />,
            iconPath:
                'M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z',
        },
        {
            label: 'Committee',
            href: '/organizer/committee',
            component: <Committee />,
            iconPath:
                'M17 20h5v-2a3 3 0 00-5.356-1.857M9 20h6m-6 0v-2a3 3 0 016 0v2M9 20H4v-2a3 3 0 015.356-1.857M15 10a3 3 0 11-6 0 3 3 0 0 1 6 0z',
        },
        {
            label: 'Calendar',
            href: '/organizer/calendar',
            component: <Calendar />,
            iconPath:
                'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5',
        },
        {
            label: 'Resources',
            href: '/organizer/resources',
            component: <Resources />,
            iconPath:
                'M13.5 21v-7.5a.75.75 0 0 1 .75-.75h3a.75.75 0 0 1 .75.75V21m-4.5 0H2.36m11.14 0H18m0 0h3.64m-1.39 0V9.349M3.75 21V9.349m0 0a3.001 3.001 0 0 0 3.75-.615A2.993 2.993 0 0 0 9.75 9.75c.896 0 1.7-.393 2.25-1.016a2.993 2.993 0 0 0 2.25 1.016c.896 0 1.7-.393 2.25-1.015a3.001 3.001 0 0 0 3.75.614',
        },
    ];

    return (
        <div className="relative bg-gradient-to-r min-h-screen flex font-poppins">
            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-50 bg-[#069efd] w-64 h-full flex flex-col transition-transform duration-300 ease-in-out transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                        <img src={logo} alt="Logo" className="h-10 w-auto" />
                        <span className="text-white text-xl font-semibold">Dashboard</span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="text-gray-500 hover:text-[#FC8239] dark:text-gray-300 dark:hover:text-white cursor-pointer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                </div>


                <nav className="flex-1 overflow-y-auto">
                    <ul className="p-4 space-y-2">
                        {navItems.map((item, idx) => (
                            <li className="animate-fade-in" style={{ animationDelay: `${(idx + 1) * 0.1}s` }} key={item.label}>
                                <a
                                    href={item.href}
                                    className="flex items-center p-2 text-gray-700 dark:text-white rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900 transition"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.iconPath} />
                                    </svg>
                                    {item.label}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={handleLogout}
                        className="flex items-center text-gray-700 dark:text-white hover:text-[#FC8239] transition cursor-pointer"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h6a2 2 0 012 2v1" />
                        </svg>
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main content + Navbar */}
            <div className="flex-1 min-h-screen bg-white">

                {/* Top Navbar */}
                <header>
                    <div className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-6 py-4 bg-[#069efd] backdrop-blur-md shadow-md h-18.5">

                        {/* Left Section: Hamburger & Logo */}
                        <div className="flex items-center space-x-4 ">

                            <button
                                onClick={() => setIsSidebarOpen(true)}
                                className="text-white hover:text-gray-300 focus:outline-none cursor-pointer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                            </button>

                            <span className="text-2xl font-semibold font-poppins text-white px-2  ">Event Link </span>


                        </div>


                        {/* Right Section: Dashboard title and logout */}
                        <div className="flex items-center space-x-6">
                            {/* <span className="text-lg font-semibold font-poppins text-white">Hi, John <span>😊</span>
                                !</span> */}

                            <span className={`text-lg font-semibold font-poppins text-white ${isBouncing ? 'animate-bounce' : ''}`}>
                                Hi, User! <span>😊</span>
                            </span>


                            {/* Logout Button */}
                            <button
                                onClick={handleLogout}
                                className="flex items-center text-white space-x-1 hover:text-red-100 focus:outline-none cursor-pointer"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                                </svg>

                            </button>

                            <main></main>


                        </div>
                    </div>
                </header>




            </div>
        </div>
    );
};

export default SideBarOrg;
