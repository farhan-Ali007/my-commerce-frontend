import React, { useEffect, useState } from "react";
import {
  FaUsers,
  FaBoxOpen,
  FaShoppingCart,
  FaTags,
  FaCrown,
  FaFileAlt,
} from "react-icons/fa";
import { MdCampaign } from "react-icons/md";
import { BiSolidCategory } from "react-icons/bi";
import { RiMenuUnfoldFill } from "react-icons/ri";
import { GiVerticalBanner } from "react-icons/gi";
import { FaFolderOpen } from "react-icons/fa6";
import AllProducts from "./AllProducts";
import AllUsers from "./AllUsers";
import AllOrders from "./AllOrders";
import { MdFiberNew } from "react-icons/md";
import NewOrders from "./NewOrders";
import AdminCategories from "./AdminCategories";
import AdminTags from "./AdminTags";
import AdminSubs from "./AdminSubs";
import MenuCategories from "./MenuCategories";
import AdminTopbarText from "./TopBar";
import AdminBanner from "./AdminBanner";
import AdminBrands from "./AdminBrands";
import AdminDynamicPages from "./AdminDynamicPages";
import { getRecentOrders } from "../../functions/order";
import AdminFooter from "./AdminFooter";
import { MdOutlineSpaceBar } from "react-icons/md";

const AdminDashboard = () => {
  const [selectedPage, setSelectedPage] = useState("allProducts");
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
        className={`w-full lg:w-1/5 bg-gray-800 z-[100] h-max text-white flex flex-col absolute lg:relative transform ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:transform-none transition-transform duration-200 ease-in-out`}
      >
        <h2 className="text-2xl font-bold p-4">Admin Panel</h2>
        <nav className="flex flex-col gap-4 p-4">
          <button
            className={`flex items-center gap-3 py-2 px-4 text-left ${
              selectedPage === "allProducts"
                ? "bg-gray-700 rounded-full"
                : "hover:bg-gray-700 rounded-full"
            }`}
            onClick={() => {
              setSelectedPage("allProducts");
              setIsSidebarOpen(false);
            }}
          >
            <FaBoxOpen className="text-lg" />
            All Products
          </button>
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
            All Users
          </button>
          <button
            className={`flex items-center gap-3 py-2 px-4 text-left ${
              selectedPage === "adminBanner"
                ? "bg-gray-700 rounded-full"
                : "hover:bg-gray-700 rounded-full"
            }`}
            onClick={() => {
              setSelectedPage("adminBanner");
              setIsSidebarOpen(false);
            }}
          >
            <GiVerticalBanner className="text-lg" />
            Banner
          </button>
          <button
            className={`flex items-center gap-3 py-2 px-4 text-left ${
              selectedPage === "allCategories"
                ? "bg-gray-700 rounded-full"
                : "hover:bg-gray-700 rounded-full"
            }`}
            onClick={() => {
              setSelectedPage("allCategories");
              setIsSidebarOpen(false);
            }}
          >
            <BiSolidCategory className="text-lg" />
            Categories
          </button>
          <button
            className={`flex items-center gap-3 py-2 px-4 text-left ${
              selectedPage === "menuCategories"
                ? "bg-gray-700 rounded-full"
                : "hover:bg-gray-700 rounded-full"
            }`}
            onClick={() => {
              setSelectedPage("menuCategories");
              setIsSidebarOpen(false);
            }}
          >
            <RiMenuUnfoldFill className="text-lg" />
            Menu Categories
          </button>
          <button
            className={`flex items-center gap-3 py-2 px-4 text-left ${
              selectedPage === "allSubs"
                ? "bg-gray-700 rounded-full"
                : "hover:bg-gray-700 rounded-full"
            }`}
            onClick={() => {
              setSelectedPage("allSubs");
              setIsSidebarOpen(false);
            }}
          >
            <FaFolderOpen className="text-lg" />
            SubCategories
          </button>
          <button
            className={`flex items-center gap-3 py-2 px-4 text-left ${
              selectedPage === "allBrands"
                ? "bg-gray-700 rounded-full"
                : "hover:bg-gray-700 rounded-full"
            }`}
            onClick={() => {
              setSelectedPage("allBrands");
              setIsSidebarOpen(false);
            }}
          >
            <FaCrown className="text-lg" />
            Brands
          </button>
          <button
            className={`flex items-center gap-3 py-2 px-4 text-left ${
              selectedPage === "allTags"
                ? "bg-gray-700 rounded-full"
                : "hover:bg-gray-700 rounded-full"
            }`}
            onClick={() => {
              setSelectedPage("allTags");
              setIsSidebarOpen(false);
            }}
          >
            <FaTags className="text-lg" />
            Tags
          </button>
          <button
            className={`flex items-center gap-3 py-2 px-4 text-left ${
              selectedPage === "allOrders"
                ? "bg-gray-700 rounded-full"
                : "hover:bg-gray-700 rounded-full"
            }`}
            onClick={() => {
              setSelectedPage("allOrders");
              setIsSidebarOpen(false);
            }}
          >
            <FaShoppingCart className="text-lg" />
            All Orders
          </button>
          <button
            className={`flex items-center gap-3 py-2 px-4 text-left ${
              selectedPage === "newOrders"
                ? "bg-gray-700 rounded-full"
                : "hover:bg-gray-700 rounded-full"
            }`}
            onClick={() => {
              setSelectedPage("newOrders");
              setIsSidebarOpen(false);
            }}
          >
            <span className="relative group flex items-center">
              <MdFiberNew className="text-lg" />
              {newOrdersCount > 0 && (
                <span className="absolute -top-2 right-0 bg-red-600 text-white text-xs font-bold rounded-full px-1.5 py-0.5 z-20 min-w-[18px] flex items-center justify-center border-2 border-gray-800">
                  {newOrdersCount}
                </span>
              )}
              <span className="absolute left-1/2 -translate-x-1/2 mt-8 w-max bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
                {newOrdersCount} new orders
              </span>
            </span>
            New Orders
          </button>
          <button
            className={`flex items-center gap-3 py-2 px-4 text-left ${
              selectedPage === "dynamicPages"
                ? "bg-gray-700 rounded-full"
                : "hover:bg-gray-700 rounded-full"
            }`}
            onClick={() => {
              setSelectedPage("dynamicPages");
              setIsSidebarOpen(false);
            }}
          >
            <FaFileAlt className="text-lg" />
            Pages
          </button>
          <button
            className={`flex items-center gap-3 py-2 px-4 text-left ${
              selectedPage === "topbarText"
                ? "bg-gray-700 rounded-full"
                : "hover:bg-gray-700 rounded-full"
            }`}
            onClick={() => {
              setSelectedPage("topbarText");
              setIsSidebarOpen(false);
            }}
          >
            <MdCampaign className="text-lg" />
            Topbar Text
          </button>
          <button
            className={`flex items-center gap-3 py-2 px-4 text-left ${
              selectedPage === "footer"
                ? "bg-gray-700 rounded-full"
                : "hover:bg-gray-700 rounded-full"
            }`}
            onClick={() => {
              setSelectedPage("footer");
              setIsSidebarOpen(false);
            }}
          >
            <MdOutlineSpaceBar className="text-lg" />
            Footer
          </button>
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
