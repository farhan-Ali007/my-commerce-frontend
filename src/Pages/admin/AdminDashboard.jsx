import React, { useEffect, useState } from "react";
import { BiSolidCategory } from "react-icons/bi";
import {
  FaBoxOpen,
  FaCrown,
  FaFileAlt,
  FaRegImage,
  FaShoppingCart,
  FaTags,
  FaUsers,
} from "react-icons/fa";
import { GiVerticalBanner } from "react-icons/gi";
import { IoNotifications } from "react-icons/io5";
import {
  MdCampaign,
  MdColorLens,
  MdFiberNew,
  MdOutlineSpaceBar,
  MdSettings,
} from "react-icons/md";
import { RiMenuUnfoldFill } from "react-icons/ri";
import { SiSimpleanalytics } from "react-icons/si";
import { getRecentOrders } from "../../functions/order";
import AdminBanner from "./AdminBanner";
import AdminBrands from "./AdminBrands";
import AdminCategories from "./AdminCategories";
import AdminColorSettings from "./AdminColorSettings";
import AdminDynamicPages from "./AdminDynamicPages";
import AdminFooter from "./AdminFooter";
import AdminLogo from "./AdminLogo";
import AdminPopups from "./AdminPopups";
import AdminSubs from "./AdminSubs";
import AdminTags from "./AdminTags";
import AllOrders from "./AllOrders";
import AllProducts from "./AllProducts";
import AllUsers from "./AllUsers";
import Dashboard from "./Dashboard";
import MenuCategories from "./MenuCategories";
import NewOrders from "./NewOrders";
import AdminTopbarText from "./TopBar";

const AdminDashboard = () => {
  const [selectedPage, setSelectedPage] = useState("dashboard");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [newOrdersCount, setNewOrdersCount] = useState(1);

  useEffect(() => {
    const savedPage = localStorage.getItem("selectedPage");
    if (savedPage) {
      setSelectedPage(savedPage);
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    localStorage.setItem("selectedPage", selectedPage);
  }, [selectedPage]);

  useEffect(() => {
    const fetchNewOrdersCount = async () => {
      try {
        const response = await getRecentOrders();
        setNewOrdersCount(response?.orders?.length || 0);
      } catch (error) {
        setNewOrdersCount(0);
      }
    };
    fetchNewOrdersCount();
  }, []);

  const renderContent = () => {
    switch (selectedPage) {
      case "dashboard":
        return (
          <div>
            <Dashboard />
          </div>
        );
      case "logo":
        return (
          <div>
            <AdminLogo />
          </div>
        );
      case "allUsers":
        return (
          <div>
            <AllUsers />
          </div>
        );
      case "allProducts":
        return (
          <div>
            <AllProducts />
          </div>
        );
      case "allOrders":
        return (
          <div>
            <AllOrders />
          </div>
        );
      case "allCategories":
        return (
          <div>
            <AdminCategories />
          </div>
        );
      case "menuCategories":
        return (
          <div>
            <MenuCategories />
          </div>
        );
      case "adminBanner":
        return (
          <div>
            <AdminBanner />
          </div>
        );
      case "allBrands":
        return (
          <div>
            <AdminBrands />
          </div>
        );
      case "allTags":
        return (
          <div>
            <AdminTags />
          </div>
        );
      case "allSubs":
        return (
          <div>
            <AdminSubs />
          </div>
        );
      case "newOrders":
        return (
          <div>
            <NewOrders />
          </div>
        );
      case "dynamicPages":
        return (
          <div>
            <AdminDynamicPages />
          </div>
        );
      case "topbarText":
        return (
          <div>
            <AdminTopbarText />
          </div>
        );
      case "footer":
        return (
          <div>
            <AdminFooter />
          </div>
        );
      case "colorSettings":
        return (
          <div>
            <AdminColorSettings />
          </div>
        );
      case "popups":
        return (
          <div>
            <AdminPopups />
          </div>
        );
      default:
        return <div>Select a page from the navigation</div>;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row min-h-screen w-full overflow-hidden">
      {/* Sidebar Toggle Button for Mobile and Tablet */}
      <button
        className="lg:hidden p-4 bg-gray-800 text-white"
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
      >
        <RiMenuUnfoldFill className="text-lg" />
      </button>

      {/* Sidebar */}
      <div
        className={`w-full lg:w-1/5 bg-gray-800 z-[100] h-[calc(100vh+64px)] text-white flex flex-col absolute lg:relative transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:transform-none transition-transform duration-200 ease-in-out`}
      >
        <div className="flex items-center justify-between p-4">
          <h2 className="text-2xl font-bold">Admin Panel</h2>
          <button
            onClick={() => setSelectedPage("colorSettings")}
            className="lg:hidden p-2 bg-gray-700 rounded-full hover:bg-gray-600 transition-colors"
            title="Color Settings"
          >
            <MdColorLens className="text-lg" />
          </button>
        </div>
        <nav className="flex flex-col gap-2 text-white">
          {/* Dashboard */}
          <button
            className={`flex items-center gap-3 py-2 px-4 text-left ${
              selectedPage === "dashboard"
                ? "bg-gray-700 rounded-full"
                : "hover:bg-gray-700 rounded-full"
            }`}
            onClick={() => {
              setSelectedPage("dashboard");
              setIsSidebarOpen(false);
            }}
          >
            <SiSimpleanalytics className="text-lg" />
            Dashboard
          </button>

          {/* Products group with hover submenu */}
          <div className="relative group">
            <button
              className={`w-full flex items-center gap-3 py-2 px-4 text-left ${"hover:bg-gray-700 rounded-full"}`}
            >
              <FaBoxOpen className="text-lg" />
              Products
            </button>
            <div className="absolute left-full top-0 -ml-2 hidden group-hover:block z-50">
              <div className="min-w-[220px] bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-2">
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-700 rounded"
                  onClick={() => {
                    setSelectedPage("allProducts");
                    setIsSidebarOpen(false);
                  }}
                >
                  <FaBoxOpen /> All Products
                </button>
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-700 rounded"
                  onClick={() => {
                    setSelectedPage("allUsers");
                    setIsSidebarOpen(false);
                  }}
                >
                  <FaUsers /> Users
                </button>
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-700 rounded"
                  onClick={() => {
                    setSelectedPage("allTags");
                    setIsSidebarOpen(false);
                  }}
                >
                  <FaTags /> Tags
                </button>
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-700 rounded"
                  onClick={() => {
                    setSelectedPage("allCategories");
                    setIsSidebarOpen(false);
                  }}
                >
                  <BiSolidCategory /> Categories
                </button>
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-700 rounded"
                  onClick={() => {
                    setSelectedPage("allBrands");
                    setIsSidebarOpen(false);
                  }}
                >
                  <FaCrown /> Brands
                </button>
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-700 rounded"
                  onClick={() => {
                    setSelectedPage("allSubs");
                    setIsSidebarOpen(false);
                  }}
                >
                  <RiMenuUnfoldFill /> Subcategories
                </button>
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-700 rounded"
                  onClick={() => {
                    setSelectedPage("menuCategories");
                    setIsSidebarOpen(false);
                  }}
                >
                  <GiVerticalBanner /> Menu Categories
                </button>
              </div>
            </div>
          </div>

          {/* Keep Users standalone */}
          <button
            className={`flex items-center gap-3 py-2 px-4 text-left ${
              selectedPage === "allUsers"
                ? "bg-gray-700 rounded-full"
                : "hover:bg-gray-700 rounded-full"
            }`}
            onClick={() => {
              setSelectedPage("allUsers");
              setIsSidebarOpen(false);
            }}
          >
            <FaUsers className="text-lg" />
            Users
          </button>
          {/* Orders group with hover submenu */}
          <div className="relative group">
            <button
              className={`w-full flex items-center gap-3 py-2 px-4 text-left ${"hover:bg-gray-700 rounded-full"}`}
            >
              <FaShoppingCart className="text-lg" />
              Orders
              {newOrdersCount > 0 && (
                <span className="ml-auto bg-red-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5">
                  {newOrdersCount}
                </span>
              )}
            </button>
            <div className="absolute left-full top-0 -ml-2 hidden group-hover:block z-50">
              <div className="min-w-[200px] bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-2">
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-700 rounded"
                  onClick={() => {
                    setSelectedPage("allOrders");
                    setIsSidebarOpen(false);
                  }}
                >
                  <FaShoppingCart /> All Orders
                </button>
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-700 rounded"
                  onClick={() => {
                    setSelectedPage("newOrders");
                    setIsSidebarOpen(false);
                  }}
                >
                  <MdFiberNew /> New Orders
                  {newOrdersCount > 0 && (
                    <span className="ml-auto text-xs bg-red-600 text-white rounded px-1">
                      {newOrdersCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
          {/* Customization group with hover submenu */}
          <div className="relative group">
            <button
              className={`w-full flex items-center gap-3 py-2 px-4 text-left ${"hover:bg-gray-700 rounded-full"}`}
            >
              <MdSettings className="text-lg" />
              Customization
            </button>
            <div className="absolute left-full -top-32 -ml-2 hidden group-hover:block z-50">
              <div className="min-w-[220px] bg-gray-800 border border-gray-700 rounded-lg shadow-lg p-2">
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-700 rounded"
                  onClick={() => {
                    setSelectedPage("logo");
                    setIsSidebarOpen(false);
                  }}
                >
                  <FaRegImage /> Logo
                </button>
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-700 rounded"
                  onClick={() => {
                    setSelectedPage("topbarText");
                    setIsSidebarOpen(false);
                  }}
                >
                  <MdCampaign /> Topbar
                </button>
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-700 rounded"
                  onClick={() => {
                    setSelectedPage("dynamicPages");
                    setIsSidebarOpen(false);
                  }}
                >
                  <FaFileAlt /> Pages
                </button>
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-700 rounded"
                  onClick={() => {
                    setSelectedPage("footer");
                    setIsSidebarOpen(false);
                  }}
                >
                  <MdOutlineSpaceBar /> Footer
                </button>
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-700 rounded"
                  onClick={() => {
                    setSelectedPage("colorSettings");
                    setIsSidebarOpen(false);
                  }}
                >
                  <MdColorLens /> Color Settings
                </button>
                <button
                  className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-700 rounded"
                  onClick={() => {
                    setSelectedPage("popups");
                    setIsSidebarOpen(false);
                  }}
                >
                  <IoNotifications /> Popup
                </button>
              </div>
            </div>
          </div>
        </nav>
      </div>

      {/* Main Content */}
      <div className="w-full lg:w-4/5 p-2 lg:p-8 lg:pt-0 bg-gray-100 overflow-y-auto">
        {renderContent()}
      </div>
    </div>
  );
};

export default AdminDashboard;
