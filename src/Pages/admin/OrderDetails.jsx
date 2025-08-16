import React from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
import { GiMoneyStack } from "react-icons/gi";
import { IoMdCall } from "react-icons/io";
import { dateFormatter } from "../../utils/dateFormatter";

const Row = ({ label, children }) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-1 py-1">
    <div className="w-32 text-gray-500 text-sm">{label}</div>
    <div className="flex-1 text-sm text-gray-800">{children}</div>
  </div>
);

const getImageUrl = (img) => {
  if (!img) return "";
  if (typeof img === "string") return img;
  if (typeof img === "object") return img.url || "";
  return "";
};

const OrderDetails = () => {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { orderId } = useParams();
  const order = state?.order;

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => navigate(state?.from || "/admin/orders")}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded border hover:bg-gray-50 text-sm"
          >
            <MdArrowBack /> Back
          </button>
        </div>

        {!order ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-700">
              Unable to load order details directly. Please open this page via the
              Orders list using the eye icon.
            </p>
            <p className="mt-2 text-gray-500 text-sm">Order ID: {orderId}</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Order Details</h1>
                  <p className="text-gray-500 text-sm">Order ID: {order._id}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 capitalize">
                    {order?.source || "web"}
                  </span>
                  <select
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md"
                    value={order.status || "Pending"}
                    disabled
                  >
                    {(["Pending", "Shipped", "Delivered", "Cancelled"]).map((status) => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <Row label="Ordered On">
                    {dateFormatter(order.orderedAt)}
                  </Row>
                  <Row label="Customer">
                    {order?.orderedBy?.username || order?.shippingAddress?.fullName}
                  </Row>
                  <Row label="Phone">
                    <span className="inline-flex items-center gap-1">
                      <IoMdCall /> {order?.shippingAddress?.mobile}
                    </span>
                  </Row>
                  <Row label="City">{order?.shippingAddress?.city || "—"}</Row>
                </div>
                <div>
                  <Row label="Delivery Charges">Rs.{order?.deliveryCharges}</Row>
                  <Row label="Total" >
                    <span className="font-semibold text-green-700 inline-flex items-center gap-1">
                      <GiMoneyStack /> Rs.{order?.totalPrice}
                    </span>
                  </Row>
                  <Row label="Notes">
                    {order?.additionalInstructions || "—"}
                  </Row>
                </div>
              </div>

              <div className="mt-3">
                <Row label="Address">
                  <span className="block">{order?.shippingAddress?.streetAddress || "—"}</span>
                </Row>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Products</h2>
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-50 text-left text-xs uppercase text-gray-600">
                      <th className="px-3 py-2">Image</th>
                      <th className="px-3 py-2">Product</th>
                      <th className="px-3 py-2">Price</th>
                      <th className="px-3 py-2">Qty</th>
                      <th className="px-3 py-2">Variants</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {order.cartSummary?.map((p, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2">
                          <img
                            src={getImageUrl(p.image)}
                            alt={p.title}
                            className="w-12 h-12 rounded object-cover border bg-gray-100"
                            onError={(e) => {
                              e.currentTarget.onerror = null;
                              e.currentTarget.src = "/auth-bg.jpg";
                            }}
                          />
                        </td>
                        <td className="px-3 py-2 text-sm text-blue-700">{p.title}</td>
                        <td className="px-3 py-2 text-sm font-semibold">Rs.{p.price}</td>
                        <td className="px-3 py-2 text-sm">{p.count}</td>
                        <td className="px-3 py-2 text-xs">
                          {p.selectedVariants && p.selectedVariants.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {p.selectedVariants.map((v, vIdx) => (
                                <span key={vIdx} className="px-2 py-0.5 border capitalize">
                                  {v.name}: {v.values.join(", ")}
                                </span>
                              ))}
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
