import React, { useEffect, useState } from "react";
import { getMyOrders } from "../../functions/order";
import { useSelector } from "react-redux";
import toast from "react-hot-toast";
import { truncateTitle } from "../../helpers/truncateTitle";
import { Link } from "react-router-dom";

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

  if (loading) return <p className="font-medium text-xl text-center">Loading...</p>;

  return (
    <div className=" px-4 py-4 md:px-6 lg:px-6  min-h-screen">
      <h1 className="text-xl md:text-2xl font-bold text-gray-800 mb-0 md:mb-3 lg:mb-4 mt-1 text-center">
        Order History {" "}
        <p>
          <Link to="/shop" className="text-main underline">Continue</Link>
        </p>
      </h1>

      {orders.length === 0 ? (
        <p className="text-center text-gray-500 text-lg font-medium">
          No orders yet.
        </p>
      ) : (
        <div className="space-y-8">
          {orders.map((order, index) => (
            <div key={index} className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-6">
              <h2 className="text-xl font-semibold text-gray-700 mb-4">
                Order #{index + 1}
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse border border-gray-300">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="border border-gray-300 px-4 py-2 text-left">Field</th>
                      <th className="border border-gray-300 px-4 py-2 text-left">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Order ID</td>
                      <td className="border border-gray-300 px-4 py-2">{order._id}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 font-bold px-4 py-2">Status</td>
                      <td
                        className={`border border-gray-300 px-4 py-2 p-1 font-bold text-white ${order?.status === "Pending"
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
                      <td className="border border-gray-300 px-4 py-2">Products</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {order?.cartSummary?.map((product, productIndex) => (
                          <div key={productIndex} className="mb-4">
                            <div>
                              <strong>Title:</strong> {truncateTitle(product.product?.title, 30)}
                            </div>
                            <div>
                              {product.selectedVariants.map((variant, variantIndex) => (
                                <div key={variantIndex} className="capitalize">
                                  <strong>{variant.name}:</strong> {variant.values.join(", ")}
                                </div>
                              ))}
                            </div>
                            <div>
                              <strong>Count:</strong> {product.count}
                            </div>
                            <div>
                              <strong>Price:</strong> {product?.price}
                            </div>
                            <div>
                              <strong>Total Price: </strong>
                              {product?.price} X {product?.count} = {product?.price * product.count}
                            </div>
                            <hr />
                          </div>
                        ))}
                      </td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 font-bold py-2">DeliveryCharges</td>
                      <td className="border border-gray-300 px-4 font-semibold py-2">{order?.deliveryCharges}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 font-bold py-2">Total Bill</td>
                      <td className="border border-gray-300 px-4 font-semibold py-2">{order?.totalPrice}</td>
                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Ordered By</td>
                      <td className="border border-gray-300 px-4 py-2">
                        {order?.orderedBy?.username || `${order?.shippingAddress?.firstName} ${order?.shippingAddress?.lastName}`}
                      </td>

                    </tr>
                    <tr>
                      <td className="border border-gray-300 px-4 py-2">Ordered On</td>
                      <td className="border border-gray-300 px-4 py-2 uppercase gap-2">
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
      )}
    </div>
  );
};

export default History;
