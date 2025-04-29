import { Routes, Route } from "react-router-dom";
import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "./hooks/reduxHooks";
import { getUserDetails } from "./store/slices/userSlice";

// pages
import AdminView from "./views/AdminView";
import HomeView from "./views/HomeView";
import AuthView from "./views/AuthView";
import StaffView from "./views/StaffView";
import EventView from "./views/EventView/EventView";
import ClubsView from "./views/Clubs/ClubsView";
import OrganizerView from "./views/OrganizerView";

//Organizer Pages 
import EventOrg from "./views/EventOrg";
import Profile from "./views/Profile/Profile";
import Committee from "./views/Committee/Committee";
import Resources from "./views/Resources/Resources";
import Calendar from "./views/Calendar/Calendar";

// components
import { LoadingSpinner } from "./components";
import SideBarOrg from "./components/SideBar/SideBarOrg";
import Sidebar from "./components/SideBar/SideBar";
import EventDetail from "./views/EventView/MoreDetailsEventView";

function App() {
  const token = localStorage.getItem("token");

  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);

  useEffect(() => {
    if (token) {
      dispatch(getUserDetails());
    }
  }, [dispatch, token]);

  const renderSidebar = () => {
    const role = user.data?.role;

    if (role === "organizer") {
      return <SideBarOrg />;
    } else if (role === "admin") {
      return <Sidebar />;
    } else {
      return null;
    }
  };

  return (
    <>
      <div>
        <LoadingSpinner isLoading={user.isLoading} />

        {renderSidebar()}

        <Routes>
          <Route path="/" element={<HomeView />} />
          <Route path="/admin" element={<AdminView />} />
          <Route path="/login" element={<AuthView />} />
          <Route path="/staff" element={<StaffView />} />
          <Route path="/events" element={<EventView />} />
          <Route path="/events/:id" element={<EventDetail />} />
          <Route path="/clubs" element={<ClubsView />} />

          <Route path="/organizer" element={<OrganizerView />} />


          <Route path="/organizer/eventsAdmin" element={<EventOrg />} />
          <Route path="/organizer/profile" element={<Profile />} />
          <Route path="/organizer/committee" element={<Committee />} />
          <Route path="/organizer/resources" element={<Resources />} />
          <Route path="/organizer/calendar" element={<Calendar />} />

        </Routes>


      </div>



      <div className="absolute inset-0 -z-10 h-full w-full bg-white bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]">
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-fuchsia-400 opacity-20 blur-[100px]"></div>
      </div>
    </>
  );
}

export default App;
