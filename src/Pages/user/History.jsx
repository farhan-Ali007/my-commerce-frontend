import React, { useEffect, useState } from "react";
import { getMyOrders } from "../../functions/order";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { truncateTitle } from "../../helpers/truncateTitle";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const History = () => {
  const { user } = useSelector((state) => state.auth);
  const userId = user?._id;
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchMyOrders = async () => {
    try {
      setLoading(true);
      const response = await getMyOrders(userId);
      console.log("My Orders------->", response);
      setOrders(response?.orders || []);
    } catch (error) {
      console.log("Error in fetching your orders", error);
      toast.error("Error in fetching orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyOrders();
  }, []);

  // Sort orders so most recent is first
  const sortedOrders = [...orders].sort((a, b) => new Date(b.orderedAt) - new Date(a.orderedAt));

  if (loading) return <p className="font-medium text-xl text-center">Loading...</p>;

  return (
    <div className="px-4 py-4 md:px-6 lg:px-6 min-h-screen">
      {orders.length === 0 ? (
        <div className="flex flex-col items-center min-h-[70vh] px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="max-w-[300px] max-h-[300px] w-full"
          >
            <img 
              src="/no-order.png" 
              alt="No Orders" 
              loading='lazy' 
              className="w-full h-auto object-contain"
            />
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold font-space text-gray-800 mb-4">
                No Orders Yet
              </h2>
              <Link 
                to="/shop"
                className="inline-block bg-secondary no-underline hover:bg-main-dark text-primary font-semibold px-8 py-3 rounded-full transition duration-300 transform hover:scale-105"
              >
                Start Shopping
              </Link>
            </div>
          </motion.div>
        </div>
      ) : (
        <>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-0 md:mb-3 lg:mb-4 mt-1 text-center">
            Order History
          </h1>
          <div className="space-y-8">
            {sortedOrders.map((order, index) => (
              <div key={index} className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
                <h2 className="text-xl font-semibold text-gray-700 mb-4">
                  Order #{index + 1}
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden shadow-md">
                    <thead>
                      <tr className="bg-gray-100">
                        <th className="border-b border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700 w-1/4">Field</th>
                        <th className="border-b border-gray-300 px-4 py-3 text-left text-sm font-semibold text-gray-700 w-3/4">Details</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td className="border-b border-gray-200 px-4 py-3 text-sm font-medium text-gray-700">Order ID</td>
                        <td className="border-b border-gray-200 px-4 py-3 text-sm text-gray-800">{order._id}</td>
                      </tr>
                      <tr>
                        <td className="border-b border-gray-200 px-4 py-3 text-sm font-medium text-gray-700">Status</td>
                        <td
                          className={`border-b border-gray-200 px-4 py-3 text-sm font-semibold text-white ${
                            order?.status === "Pending"
                              ? "bg-blue-500"
                              : order?.status === "Delivered"
                                ? "bg-green-500"
                                : order?.status === "Cancelled"
                                  ? "bg-red-500"
                                  : "bg-gray-500"
                          }`}
                        >
                          {order?.status}
                        </td>

                      </tr>
                      <tr>
                        <td className="border-b border-gray-200 px-4 py-3 text-sm font-medium text-gray-700">Products</td>
                        <td className="border-b border-gray-200 px-0 py-0">
                          <table className="w-full border-collapse">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="border-b border-gray-200 px-4 py-2 text-left text-xs font-semibold text-gray-600 w-1/6">Image</th>
                                <th className="border-b border-gray-200 px-4 py-2 text-left text-xs font-semibold text-gray-600 w-3/6">Product</th>
                                <th className="border-b border-gray-200 px-4 py-2 text-center text-xs font-semibold text-gray-600 w-1/6">Count</th>
                                <th className="border-b border-gray-200 px-4 py-2 text-right text-xs font-semibold text-gray-600 w-1/6">Price</th>
                              </tr>
                            </thead>
                            <tbody>
                              {order?.cartSummary?.map((product, productIndex) => (
                                <tr key={productIndex} className="border-b border-gray-200 last:border-b-0">
                                  <td className="border-b border-gray-200 px-4 py-2">
                                    <img 
                                      src={product.image} 
                                      alt={product.title} 
                                      className="w-14 h-14 object-cover rounded"
                                      loading="lazy"
                                    />
                                  </td>
                                  <td className="border-b border-gray-200 px-4 py-2 text-sm text-gray-800">
                                    <div className="font-medium mb-1">{truncateTitle(product.title, 40)}</div>
                                    <div>
                                      {product.selectedVariants.map((variant, variantIndex) => (
                                        <div key={variantIndex} className="capitalize text-xs text-gray-600">
                                          <span className="font-semibold">{variant.name}:</span> {variant.values.join(", ")}
                                        </div>
                                      ))}
                                    </div>
                                  </td>
                                  <td className="border-b border-gray-200 px-4 py-2 text-center text-sm text-gray-800">{product.count}</td>
                                  <td className="border-b border-gray-200 px-4 py-2 text-right text-sm font-semibold text-gray-800">Rs.{product?.price?.toLocaleString()}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border-b border-gray-200 px-4 py-2 text-sm font-medium text-gray-700">Delivery Charges</td>
                        <td className="border-b border-gray-200 px-4 py-2 text-sm text-gray-800">Rs.{order?.deliveryCharges?.toLocaleString()}</td>
                      </tr>
                      <tr className="bg-gray-50">
                        <td className="border-b border-gray-200 px-4 py-2 text-sm font-medium text-gray-700">Total Bill</td>
                        <td className="border-b border-gray-200 px-4 py-2 text-sm font-semibold text-gray-800">Rs.{order?.totalPrice?.toLocaleString()}</td>
                      </tr>
                      <tr>
                        <td className="border-b border-gray-200 px-4 py-2 text-sm font-medium text-gray-700">Ordered By</td>
                        <td className="border-b border-gray-200 px-4 py-2 text-sm text-gray-800">
                          {order?.orderedBy?.username || `${order?.shippingAddress?.firstName} ${order?.shippingAddress?.lastName}`}
                        </td>

                      </tr>
                      <tr>
                        <td className="border-b border-gray-200 px-4 py-2 text-sm font-medium text-gray-700">Ordered On</td>
                        <td className="border-b border-gray-200 px-4 py-2 text-sm text-gray-800 uppercase">
                          {new Date(order?.orderedAt).toLocaleString("en-GB", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          })}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default History;
