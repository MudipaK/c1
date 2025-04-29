import { useState } from "react";
import {
  Dialog,
  DialogBackdrop,
  DialogPanel,
  TransitionChild,
} from "@headlessui/react";
import {
  Bars3Icon,
  CogIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import ManageUsers from "../../views/AdminUserManagementView";
import ManageOrganizations from "../../views/ManageOrganizationsView";
import CrewPage from "../../views/CrewView";
import AdminCalendarView from "../../views/Calendar/AdminCalendarView";
import { ShieldAlertIcon } from "lucide-react";

const navigation = [
  { name: "Dashboard", icon: HomeIcon, component: <ManageUsers /> },
  { name: "User Management", icon: UsersIcon, component: <ManageUsers /> },
  { name: "Organization Management", icon: CogIcon, component: <ManageOrganizations /> },
  { name: "Crew Management", icon: FolderIcon, component: <CrewPage /> },
  { name: "Calendar Management", icon: CalendarIcon, component: <AdminCalendarView /> },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState("Dashboard");

  // Find the selected tab's component to render
  const selectedTabComponent = navigation.find(
    (item) => item.name === selectedTab
  )?.component;

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Mobile Sidebar */}
      <Dialog
        open={sidebarOpen}
        onClose={setSidebarOpen}
        className="relative z-50 lg:hidden"
      >
        <DialogBackdrop className="fixed inset-0 bg-gray-900/80 transition-opacity" />
        <div className="fixed inset-0 flex">
          <DialogPanel className="relative mr-16 flex w-full max-w-xs flex-1 bg-gray-900 transition-transform duration-300 ease-in-out">
            <TransitionChild>
              <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                <button
                  type="button"
                  onClick={() => setSidebarOpen(false)}
                  className="-m-2.5 p-2.5"
                >
                  <span className="sr-only">Close sidebar</span>
                  <XMarkIcon aria-hidden="true" className="size-6 text-white" />
                </button>
              </div>
            </TransitionChild>

            <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6 pb-2">
              <div className="flex h-16 shrink-0 items-center">
                {/* Logo placeholder */}
              </div>
              <nav className="flex flex-1 flex-col">
                <ul role="list" className="flex flex-1 flex-col gap-y-7">
                  <li>
                    <ul role="list" className="-mx-2 space-y-1">
                      {navigation.map((item) => (
                        <li key={item.name}>
                          <button
                            onClick={() => setSelectedTab(item.name)}
                            className={classNames(
                              item.name === selectedTab
                                ? "bg-gray-800 text-white"
                                : "text-gray-400 hover:bg-gray-800 hover:text-white",
                              "group flex gap-x-3 rounded-md p-2 text-sm font-semibold"
                            )}
                          >
                            <item.icon
                              aria-hidden="true"
                              className="size-6 shrink-0"
                            />
                            {item.name}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </li>
                </ul>
              </nav>
            </div>
          </DialogPanel>
        </div>
      </Dialog>

      {/* Static Sidebar for Desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col bg-gray-900">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto px-6">
          <div className="flex h-16 shrink-0 items-center">
            {/* Logo placeholder */}
          </div>
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-7">
              <li>
                <ul role="list" className="-mx-2 space-y-1">
                  {navigation.map((item) => (
                    <li key={item.name}>
                      <button
                        onClick={() => setSelectedTab(item.name)}
                        className={classNames(
                          item.name === selectedTab
                            ? "bg-gray-800 text-white"
                            : "text-gray-400 hover:bg-gray-800 hover:text-white",
                          "group flex gap-x-3 rounded-md p-2 text-sm font-semibold w-full"
                        )}
                      >
                        <item.icon
                          aria-hidden="true"
                          className="size-6 shrink-0"
                        />
                        {item.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 lg:ml-72 p-6">
        {selectedTabComponent}
      </div>

      {/* Top Navigation for Mobile */}
      <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-gray-900 px-4 py-4 shadow-sm lg:hidden">
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="-m-2.5 p-2.5 text-gray-400"
        >
          <span className="sr-only">Open sidebar</span>
          <Bars3Icon aria-hidden="true" className="size-6" />
        </button>
        <div className="flex-1 text-sm font-semibold text-white">Dashboard</div>
      </div>
    </div>
  );
}
