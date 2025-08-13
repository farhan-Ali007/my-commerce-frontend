import React, { useEffect, useState, useRef, useCallback } from "react";
import { getAllOrders, updateOrderStatus } from "../../functions/order";
import { IoMdCall } from "react-icons/io";
import { GiMoneyStack } from "react-icons/gi";
import { MdAlternateEmail, MdNotes } from "react-icons/md";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { toast } from "react-hot-toast";
import { FcViewDetails } from "react-icons/fc";
import { IoIosPerson } from "react-icons/io";
import { GrStatusGoodSmall } from "react-icons/gr";
import SimpleBar from "simplebar-react";
import { dateFormatter } from "../../utils/dateFormatter";

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const LIMIT = 20;
  const [previewProduct, setPreviewProduct] = useState(null);
  const [previewOrder, setPreviewOrder] = useState(null);

  const fetchAllOrders = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await getAllOrders(pageNum, LIMIT);
      setTotalOrders(response?.total || 0);
      setTotalPages(response?.totalPages || 1);
      setOrders(response?.orders || []);
    } catch (error) {
      console.log("Error fetching orders", error);
    } finally {
      setLoading(false);
    }
  };

  const Statuses = ["Pending", "Shipped", "Delivered", "Cancelled"];

  useEffect(() => {
    setCurrentPage(1);
    fetchAllOrders(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setPreviewProduct(null);
        setPreviewOrder(null);
      }
    };
    if (previewProduct) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [previewProduct]);

  // Pagination controls
  const handlePageChange = useCallback(
    (pageNum) => {
      if (pageNum < 1 || pageNum > totalPages || pageNum === currentPage) return;
      setCurrentPage(pageNum);
      fetchAllOrders(pageNum);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [currentPage, totalPages]
  );

  const renderPagination = useCallback(() => {
    if (totalPages <= 1) return null;

    const createPageArray = () => {
      const pages = [];
      const delta = 1; // neighbors
      const left = Math.max(2, currentPage - delta);
      const right = Math.min(totalPages - 1, currentPage + delta);

      pages.push(1);
      if (left > 2) pages.push("ellipsis-left");
      for (let i = left; i <= right; i++) pages.push(i);
      if (right < totalPages - 1) pages.push("ellipsis-right");
      if (totalPages > 1) pages.push(totalPages);
      return pages;
    };

    const pages = createPageArray();

    return (
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 p-4 border-t">
        <div className="text-sm text-gray-600">
          Showing <span className="font-semibold">{orders.length}</span> of
          {" "}
          <span className="font-semibold">{totalOrders}</span> orders
          (Page {currentPage} of {totalPages})
        </div>
        <div className="flex items-center gap-1">
          <button
            className="px-3 py-1.5 rounded border text-sm disabled:opacity-50"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            Previous
          </button>
          {pages.map((p, idx) =>
            typeof p === "number" ? (
              <button
                key={idx}
                onClick={() => handlePageChange(p)}
                className={`px-3 py-1.5 rounded border text-sm ${
                  p === currentPage
                    ? "bg-primary text-white border-primary"
                    : "bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ) : (
              <span key={idx} className="px-2 text-gray-400">
                …
              </span>
            )
          )}
          <button
            className="px-3 py-1.5 rounded border text-sm disabled:opacity-50"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
      </div>
    );
  }, [orders.length, totalOrders, currentPage, totalPages, handlePageChange]);

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, { status: newStatus });
      const updatedOrders = orders.map((order) =>
        order._id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
      toast.success(`Status updated to ${newStatus}`);

      // Trigger notification count refresh
      window.dispatchEvent(new CustomEvent("refreshNotifications"));
    } catch (error) {
      console.log("Error updating order status", error);
      toast.error(error?.message || "Error in updating order status");
    }
  };

  // Filter orders by search query (order ID)
  const filteredOrders = orders.filter((order) =>
    order._id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            All Orders
            <span className="ml-2 text-lg font-medium text-gray-600">
              ({totalOrders} total)
            </span>
          </h1>

          {/* Search Bar */}
          {/* <div className="max-w-md">
            <input
              type="text"
              placeholder="Search Orders by Order ID..."
              value={searchQuery}
              onChange={handleSearchChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
            />
          </div> */}
        </div>

        {/* Orders Table Container */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-600">Loading orders...</p>
              </div>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-gray-400 text-6xl mb-4">📦</div>
                <p className="text-gray-600 text-lg">No orders available.</p>
                {searchQuery && (
                  <p className="text-gray-500 text-sm mt-2">
                    No orders found matching "{searchQuery}"
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <SimpleBar
                style={{
                  maxHeight: "calc(100vh - 300px)",
                  minHeight: "400px",
                }}
                options={{
                  scrollbarMinSize: 40,
                  scrollbarMaxSize: 300,
                  forceVisible: "y",
                  wheelPropagation: true,
                  wheelEventTarget: document,
                  autoHide: false,
                }}
              >
                <table className="min-w-[2000px] w-full border-collapse bg-white">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr className="border-b border-gray-200">
                      <th className="px-4 py-3 min-w-44 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                        <div className="flex items-center gap-2">
                          <IoIosPerson size={20} className="text-gray-500" />
                          <span>Customer</span>
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                        <span>Source</span>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                        <div className="flex items-center gap-2">
                          <GrStatusGoodSmall
                            size={20}
                            className="text-gray-500"
                          />
                          <span>Status</span>
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200 min-w-[500px]">
                        <div className="flex items-center gap-2">
                          <FcViewDetails size={20} />
                          <span>Products</span>
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                        <div className="flex items-center gap-2">
                          <FaMoneyBillTrendUp
                            size={20}
                            className="text-gray-500"
                          />
                          <span>Delivery</span>
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                        <div className="flex items-center gap-2">
                          <GiMoneyStack size={20} className="text-gray-500" />
                          <span>Total</span>
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                        <div className="flex items-center gap-1">
                          <IoMdCall size={20} className="text-gray-500" />
                          <span>Phone</span>
                        </div>
                      </th>
                      <th className="px-4 py-3 text-left text-xs min-w-[200px] font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                        <span>City</span>
                      </th>
                      <th className="px-4 py-3 text-left text-xs min-w-[300px] font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                        <span>Address</span>
                      </th>
                      {/* <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                        <div className="flex items-center gap-2">
                          <MdAlternateEmail
                            size={20}
                            className="text-gray-500"
                          />
                          <span>Email</span>
                        </div>
                      </th> */}
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                        <div className="flex items-center gap-2 w-56">
                          <MdNotes size={18} className="text-gray-500" />
                          <span>Notes</span>
                        </div>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredOrders.map((order, idx) => {
                      return (
                        <tr
                          key={order._id}
                          className="hover:bg-gray-50 transition-colors duration-150"
                        >
                          <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                            <span className="font-mono text-xs">
                              {dateFormatter(order.orderedAt)}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                            <div className="font-medium">
                              {order?.orderedBy?.username ||
                                `${order?.shippingAddress?.fullName}`}
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                                order?.source === "web"
                                  ? "bg-blue-100 text-blue-700"
                                  : order?.source === "mobile"
                                  ? "bg-green-100 text-green-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                              title={order?.source || "unknown"}
                            >
                              {order?.source || "unknown"}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm border-r border-gray-200">
                            <select
                              className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
                              value={order.status || "Pending"}
                              onChange={(e) =>
                                handleStatusChange(order._id, e.target.value)
                              }
                            >
                              {Statuses.map((status, index) => (
                                <option key={index} value={status}>
                                  {status}
                                </option>
                              ))}
                            </select>
                          </td>

                          <td className="px-4 py-3 border-r border-gray-200">
                            <div className="max-w-[700px]">
                              <table className="w-full border-collapse">
                                <thead>
                                  <tr className="bg-gray-100">
                                    <th className="px-2 py-1 text-xs font-semibold text-gray-600">
                                      Image
                                    </th>
                                    <th className="px-2 py-1 text-xs font-semibold text-gray-600">
                                      Product
                                    </th>
                                    <th className="px-2 py-1 text-xs font-semibold text-gray-600">
                                      Price
                                    </th>
                                    <th className="px-2 py-1 text-xs font-semibold text-gray-600">
                                      Qty
                                    </th>
                                    <th className="px-2 py-1 text-xs font-semibold text-gray-600">
                                      Variants
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {order.cartSummary?.map((product, idx) => (
                                    <tr
                                      key={idx}
                                      className="border-b last:border-b-0"
                                    >
                                      <td className="px-2 py-1">
                                        <img
                                          src={product.image}
                                          alt={product.title}
                                          className="w-12 h-12 object-cover rounded border cursor-pointer hover:shadow-lg transition"
                                          onClick={() => {
                                            setPreviewProduct(product);
                                            setPreviewOrder(order);
                                          }}
                                        />
                                      </td>
                                      <td className="px-2 py-1 text-sm font-medium text-blue-600">
                                        {product.title}
                                      </td>
                                      <td className="px-2 py-1 text-sm font-semibold">
                                        Rs.{product.price}
                                      </td>
                                      <td className="px-2 py-1 text-sm">
                                        {product.count}
                                      </td>
                                      <td className="px-2 py-1 text-xs">
                                        {product.selectedVariants &&
                                        product.selectedVariants.length > 0 ? (
                                          <div className="flex flex-wrap gap-1">
                                            {product.selectedVariants.map(
                                              (variant, vIdx) => (
                                                <span
                                                  key={vIdx}
                                                  className="px-2 py-0.5 border border-blue-200 capitalize"
                                                >
                                                  {variant.name}:{" "}
                                                  {variant.values.join(", ")}
                                                </span>
                                              )
                                            )}
                                          </div>
                                        ) : (
                                          <span className="text-gray-400">
                                            —
                                          </span>
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-sm font-semibold text-gray-900 border-r border-gray-200">
                            Rs.{order?.deliveryCharges}
                          </td>
                          <td className="px-4 py-3 text-sm font-bold text-green-600 border-r border-gray-200">
                            Rs.{order?.totalPrice}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                            <span className="font-mono">
                              {order?.shippingAddress?.mobile}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                            {order?.shippingAddress?.city || "—"}
                          </td>
                          <td className="px-4 py-3 min-w-96 text-nowrap text-sm text-gray-900 border-r border-gray-200 max-w-lg">
                            <div
                              className="truncate"
                              title={order?.shippingAddress?.streetAddress}
                            >
                              {order?.shippingAddress?.streetAddress || "—"}
                            </div>
                          </td>
                          {/* <td className="px-4 py-3 text-sm text-gray-900 border-r border-gray-200">
                            <span className="text-blue-600">
                              {order?.shippingAddress?.email}
                            </span>
                          </td> */}
                          <td className="px-4 py-3 text-sm text-gray-900">
                            <div
                              className="max-w-[150px] truncate"
                              title={order?.additionalInstructions}
                            >
                              {order?.additionalInstructions || "—"}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>

                {renderPagination()}
              </SimpleBar>
            </div>
          )}
        </div>
      </div>
      {previewProduct && previewOrder && (
        <div
          className="fixed inset-0 top-20  z-50 flex items-center justify-center bg-black bg-opacity-70"
          onClick={() => {
            setPreviewProduct(null);
            setPreviewOrder(null);
          }}
        >
          <div
            className="relative flex flex-col md:flex-row items-start justify-start bg-white rounded-lg shadow-lg p-4 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setPreviewProduct(null);
                setPreviewOrder(null);
              }}
              className="absolute top-1 right-1 rounded-full"
              aria-label="Close preview"
            >
              <span className="text-2xl font-extrabold text-primary">
                &times;
              </span>
            </button>
            <img
              src={previewProduct.image}
              alt="Preview"
              className="max-w-[200px] max-h-[200px] rounded-lg object-contain mb-4 md:mb-0 md:mr-6"
            />
            <div className="flex flex-col gap-1">
              <h2 className="text-base font-bold text-secondary">
                {previewProduct.title}
              </h2>
              <p className="text-black">
                Price:{" "}
                <span className="font-semibold">Rs.{previewProduct.price}</span>
              </p>
              <p className="text-black">
                Quantity:{" "}
                <span className="font-semibold">{previewProduct.count}</span>
              </p>
              {previewProduct.selectedVariants &&
                previewProduct.selectedVariants.length > 0 && (
                  <div>
                    <p className="text-gray-700 font-semibold">Variants:</p>
                    <ul className="list-disc list-inside text-sm text-gray-600">
                      {previewProduct.selectedVariants.map((variant, idx) => (
                        <li key={idx}>
                          <span className="font-medium">{variant.name}:</span>{" "}
                          {variant.values.join(", ")}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              <hr className="my-1 text-secondary" />
              <p className="text-black">
                <span className="font-semibold">Name:</span>{" "}
                {previewOrder?.shippingAddress?.fullName}
              </p>
              <p className="text-black">
                <span className="font-semibold">Mobile:</span>{" "}
                {previewOrder?.shippingAddress?.mobile}
              </p>
              <p className="text-black">
                <span className="font-semibold">City:</span>{" "}
                {previewOrder?.shippingAddress?.city}
              </p>
              <p className="text-black">
                <span className="font-semibold">Address:</span>{" "}
                {previewOrder?.shippingAddress?.streetAddress}
              </p>
              <p className="text-black">
                <span className="font-semibold">Ordered On:</span>{" "}
                {new Date(previewOrder?.orderedAt).toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllOrders;
