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

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const observer = useRef();
  const LIMIT = 10;
  const [previewProduct, setPreviewProduct] = useState(null);
  const [previewOrder, setPreviewOrder] = useState(null);

  const fetchAllOrders = async (pageNum = 1) => {
    try {
      if (pageNum === 1) setLoading(true);
      else setIsFetchingMore(true);
      const response = await getAllOrders(pageNum, LIMIT);
      if (pageNum === 1) {
        setOrders(response?.orders || []);
      } else {
        setOrders((prev) => [...prev, ...(response?.orders || [])]);
      }
      setHasMore(pageNum < response.totalPages);
    } catch (error) {
      console.log("Error fetching orders", error);
    } finally {
      setLoading(false);
      setIsFetchingMore(false);
    }
  };

  const Statuses = ["Pending", "Shipped", "Delivered", "Cancelled"];

  useEffect(() => {
    setPage(1);
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

  // Infinite scroll observer
  const lastOrderRef = useCallback(
    (node) => {
      if (loading || isFetchingMore || !hasMore) return;
      if (observer.current) observer.current.disconnect();
      observer.current = new window.IntersectionObserver((entries) => {
        if (entries[0].isIntersecting) {
          setPage((prev) => {
            const nextPage = prev + 1;
            fetchAllOrders(nextPage);
            return nextPage;
          });
        }
      });
      if (node) observer.current.observe(node);
    },
    [loading, isFetchingMore, hasMore]
  );

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
    <div className="container p-6 mx-auto text-center">
      <h1 className="mb-6 text-3xl font-bold text-main">
        All Orders [{`${orders.length}`}]
      </h1>
      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search Orders by Order ID"
          value={searchQuery}
          onChange={handleSearchChange}
          className="w-full px-4 py-2 border rounded-full sm:w-1/2 focus:ring-1 ring-main focus:outline-none"
        />
      </div>
      {/* Orders Table */}
      {loading ? (
        <p>Loading...</p>
      ) : filteredOrders.length === 0 ? (
        <p>No orders available.</p>
      ) : (
        <SimpleBar
          forceVisible="x"
          autoHide={false}
          style={{
            maxWidth: "100%",
            height: "320px", // or any height you want
            overflowY: "auto", // vertical scroll inside the box
            overflowX: "auto", // horizontal scroll
          }}
        >
          <table className="min-w-[2000px] border-collapse border-black table-auto border-1">
            <thead>
              <tr>
                <th className="px-6 py-2 border">Order ID</th>
                <th className="px-6 py-2 border">
                  <div className="flex items-center justify-center gap-2">
                    <IoIosPerson size={24} className="text-gray-600" />
                    <span>Customer</span>
                  </div>
                </th>
                <th className="px-6 py-2 border">
                  <div className="flex items-center justify-center gap-2">
                    <GrStatusGoodSmall size={24} className="text-gray-600" />
                    <span>Order Status</span>
                  </div>
                </th>
                <th className="px-10 py-2 border w-96">
                  <div className="flex items-center justify-center gap-2">
                    <FcViewDetails size={24} />
                    <span>Product Details</span>
                  </div>
                </th>
                <th className="px-6 py-2 border">
                  <div className="flex items-center justify-center gap-2">
                    <FaMoneyBillTrendUp size={24} className="text-gray-600" />
                    <span>Delivery Charges</span>
                  </div>
                </th>
                <th className="px-6 py-2 border">
                  <div className="flex items-center justify-center gap-2">
                    <GiMoneyStack size={24} className="text-gray-600" />
                    <span>Total Amount</span>
                  </div>
                </th>
                <th className="px-6 py-2 border">
                  <div className="flex items-center justify-center gap-1">
                    <IoMdCall size={24} className="text-gray-600" />
                    <span>Recipient ph.No</span>
                  </div>
                </th>
                <th className="px-6 py-2 border w-72">
                  <span>Address</span>
                </th>
                <th className="px-6 py-2 border">
                  <div className="flex items-center justify-center gap-2">
                    <MdAlternateEmail size={24} className="text-gray-600" />
                    <span>Mail</span>
                  </div>
                </th>
                <th className="px-6 py-2 border">
                  <div className="flex items-center justify-center gap-2">
                    <MdNotes size={22} className="text-gray-600" />
                    <span>Instructions</span>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order, idx) => {
                const isLast = idx === filteredOrders.length - 1;
                return (
                  <tr
                    key={order._id}
                    ref={
                      isLast && hasMore && !searchQuery ? lastOrderRef : null
                    }
                  >
                    <td className="px-4 py-2 border">{order._id}</td>
                    <td className="px-4 py-2 border">
                      {order?.orderedBy?.username ||
                        `${order?.shippingAddress?.fullName}`}
                    </td>
                    <td className="px-4 py-2 border">
                      <select
                        className="px-4 py-2 border rounded-md"
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

                    <td className="px-4 py-2 border min-w-[400px] max-w-[900px]">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="bg-gray-50">
                            <th className="px-2 py-1 text-xs font-semibold text-gray-600">Image</th>
                            <th className="px-2 py-1 text-xs font-semibold text-gray-600">Product</th>
                            <th className="px-2 py-1 text-xs font-semibold text-gray-600">Price</th>
                            <th className="px-2 py-1 text-xs font-semibold text-gray-600">Qty</th>
                            <th className="px-2 py-1 text-xs font-semibold text-gray-600">Variants</th>
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
                              <td className="px-2 py-1 text-sm font-medium text-main">
                                {product.title}
                              </td>
                              <td className="px-2 py-1 text-sm">
                                Rs.{product.price}
                              </td>
                              <td className="px-2 py-1 text-sm">
                                {product.count}
                              </td>
                              <td className="px-2 py-1 text-xs">
                                {product.selectedVariants && product.selectedVariants.length > 0 ? (
                                  <div className="flex flex-wrap gap-1">
                                    {product.selectedVariants.map((variant, vIdx) => (
                                      <span
                                        key={vIdx}
                                        className="bg-main/10 text-main rounded-full px-2 py-0.5 border border-main/20 capitalize"
                                      >
                                        {variant.name}: {variant.values.join(", ")}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  "-"
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </td>
                    <td className="px-4 py-2 border">
                      Rs.{order?.deliveryCharges}
                    </td>
                    <td className="px-4 py-2 border">Rs.{order?.totalPrice}</td>
                    <td className="px-4 py-2 border">
                      {order?.shippingAddress?.mobile}
                    </td>
                    <td className="px-4 py-2 border min-w-72 max-w-80">
                      {order?.shippingAddress?.streetAddress || "—"}
                    </td>
                    <td className="px-4 py-2 border">
                      {order?.shippingAddress?.email}
                    </td>
                    <td className="px-4 py-2 border">
                      {order?.additionalInstructions
                        ? order.additionalInstructions
                        : "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {isFetchingMore && (
            <div className="py-4 text-center text-gray-500">
              Loading more orders...
            </div>
          )}
          {!hasMore && (
            <div className="py-4 text-center text-gray-400 text-sm">
              No more orders to load.
            </div>
          )}
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
            className="relative flex flex-col md:flex-row items-center justify-center bg-white rounded-lg shadow-lg p-4 max-w-lg w-full"
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => {
                setPreviewProduct(null);
                setPreviewOrder(null);
              }}
              className="absolute top-2 right-2 p-2 rounded-full bg-gray-100 hover:bg-gray-200"
              aria-label="Close preview"
            >
              <span className="text-xl font-bold text-gray-700">&times;</span>
            </button>
            <img
              src={previewProduct.image}
              alt="Preview"
              className="max-w-[200px] max-h-[200px] rounded-lg object-contain mb-4 md:mb-0 md:mr-6"
            />
            <div className="flex flex-col gap-2">
              <h2 className="text-lg font-bold text-main">{previewProduct.title}</h2>
              <p className="text-gray-700">Price: <span className="font-semibold">Rs.{previewProduct.price}</span></p>
              <p className="text-gray-700">Quantity: <span className="font-semibold">{previewProduct.count}</span></p>
              {previewProduct.selectedVariants && previewProduct.selectedVariants.length > 0 && (
                <div>
                  <p className="text-gray-700 font-semibold">Variants:</p>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {previewProduct.selectedVariants.map((variant, idx) => (
                      <li key={idx}>
                        <span className="font-medium">{variant.name}:</span> {variant.values.join(', ')}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <hr className="my-2" />
              <p className="text-gray-700">
                <span className="font-semibold">Mobile:</span> {previewOrder?.shippingAddress?.mobile}
              </p>
              <p className="text-gray-700">
                <span className="font-semibold">Address:</span> {previewOrder?.shippingAddress?.streetAddress}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllOrders;
