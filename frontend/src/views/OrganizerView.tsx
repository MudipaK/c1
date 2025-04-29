import { Outlet } from "react-router-dom";
import SidebarOrg from "../components/SideBar/SideBarOrg";

const OrganizerView = () => {
    return (
        <div className="flex h-screen overflow-hidden">
            <SidebarOrg />
            <div className="flex-1 overflow-auto">
                <div className="pt-[72px]"> {/* Height of the fixed header */}
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default OrganizerView;
