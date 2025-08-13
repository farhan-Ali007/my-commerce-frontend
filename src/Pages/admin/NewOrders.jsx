import React, { useEffect, useState } from "react";
import { getRecentOrders, updateOrderStatus } from "../../functions/order";
import { toast } from "react-hot-toast";
import { IoMdCall } from "react-icons/io";
import { GiMoneyStack } from "react-icons/gi";
import { MdAlternateEmail, MdNotes } from "react-icons/md";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { FcViewDetails } from "react-icons/fc";
import { IoIosPerson } from "react-icons/io";
import { GrStatusGoodSmall } from "react-icons/gr";
import SimpleBar from "simplebar-react";
import { dateFormatter } from "../../utils/dateFormatter";

const NewOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [previewImage, setPreviewImage] = useState(null);
  const [previewProduct, setPreviewProduct] = useState(null);
  const [previewOrder, setPreviewOrder] = useState(null);

  const fetchAllOrders = async () => {
    try {
      setLoading(true);
      const response = await getRecentOrders();
      // console.log("Response of all orders for admin:", response?.orders);
      setOrders(response?.orders || []);
    } catch (error) {
      console.log("Error fetching orders", error);
    } finally {
      setLoading(false);
    }
  };

  const Statuses = ["Pending", "Shipped", "Delivered", "Cancelled"];

  useEffect(() => {
    fetchAllOrders();
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

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, { status: newStatus });

      // Update the local state with the new order status
      const updatedOrders = orders.map((order) =>
        order._id === orderId ? { ...order, status: newStatus } : order
      );
      setOrders(updatedOrders);
      toast.success(`Status updated to ${newStatus}`);
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
    <div className="container mx-auto p-6 text-center">
      <h1 className="text-3xl font-bold mb-6 text-main">
        New Orders [{`${orders.length}`}]
      </h1>

      {/* Search Bar */}
      {/* <div className="mb-4">
        <input
          type="text"
          placeholder="Search Orders by Order ID"
          value={searchQuery}
          onChange={handleSearchChange}
          className="px-4 py-2 w-full sm:w-1/2 border rounded-full focus:ring-1 ring-main focus:outline-none"
        />
      </div> */}

      {/* Orders Table */}
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
            <p className="text-gray-600">No orders found.</p>
          </div>
        </div>
      ) : (
        <SimpleBar
          style={{
            maxWidth: "100%",
            height: "360px",
            overflowX: "auto",
            overflowY: "auto",
          }}
          autoHide={false}
          forceVisible="x"
          scrollableNodeProps={{ ref: null }}
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
                    <GrStatusGoodSmall size={20} className="text-gray-500" />
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
                    <FaMoneyBillTrendUp size={20} className="text-gray-500" />
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
                <th className="px-4 py-3 text-left text-xs min-w-[150px] font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                  <span>City</span>
                </th>
                <th className="px-4 py-3 text-left text-xs min-w-[300px] font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                  <span>Address</span>
                </th>
                <th className="px-4 py-3 text-left text-xs min-w-[200px] font-semibold text-gray-700 uppercase tracking-wider">
                  <div className="flex items-center gap-2 w-56">
                    <MdNotes size={18} className="text-gray-500" />
                    <span>Notes</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredOrders.map((order) => (
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
                            <tr key={idx} className="border-b last:border-b-0">
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
                                  <span className="text-gray-400">—</span>
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
                  <td className="px-4 py-3 text-sm text-gray-900">
                    <div
                      className="max-w-[150px] truncate"
                      title={order?.additionalInstructions}
                    >
                      {order?.additionalInstructions || "—"}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </SimpleBar>
      )}
      {previewProduct && previewOrder && (
        <div
          className="fixed inset-0 top-20 z-50 flex items-center justify-center bg-black bg-opacity-70"
          onClick={() => {
            setPreviewProduct(null);
            setPreviewOrder(null);
          }}
        >
          <div
            className="relative flex flex-col md:flex-row items-center justify-center bg-white rounded-lg shadow-lg p-4 max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setPreviewProduct(null);
                setPreviewOrder(null);
              }}
              className="absolute top-1 right-1 rounded-full "
              aria-label="Close preview"
            >
              <span className="text-2xl font-bold text-secondary">&times;</span>
            </button>
            <img
              src={previewProduct.image}
              alt="Preview"
              className="max-w-[200px] max-h-[200px] rounded-lg object-contain mb-4 md:mb-0 md:mr-6"
            />
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-bold text-main">
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
              <hr className="my-2" />
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

export default NewOrders;
