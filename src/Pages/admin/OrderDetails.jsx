import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { MdArrowBack } from "react-icons/md";
import { GiMoneyStack } from "react-icons/gi";
import { IoMdCall } from "react-icons/io";
import { dateFormatter } from "../../utils/dateFormatter";
import { trackLcsStatus } from "../../functions/order";
import { getLcsBadgeTheme } from "../../utils/courierStatus";

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
  const [tracking, setTracking] = useState(null); // { status, currentCity, lastEventAt, events }
  const [trackLoading, setTrackLoading] = useState(false);

  const courierStatus = useMemo(() => {
    const fromTrack = tracking?.status;
    const pktTitle = order?.shippingProvider?.extra?.packet_list?.[0]?.title;
    const pktStatus = order?.shippingProvider?.extra?.packet_list?.[0]?.booked_packet_status;
    return (fromTrack || pktTitle || pktStatus || "—");
  }, [tracking?.status, order?.shippingProvider?.extra]);

  const courierStatusTheme = useMemo(() => getLcsBadgeTheme(courierStatus), [courierStatus]);

  const courierLastUpdated = useMemo(() => {
    const fromTrack = tracking?.lastEventAt;
    const pktDate = order?.shippingProvider?.extra?.packet_list?.[0]?.booking_date;
    return fromTrack || pktDate || null;
  }, [tracking?.lastEventAt, order?.shippingProvider?.extra]);

  const handleRefreshTracking = async () => {
    if (!order?.shippingProvider?.trackingNumber && !order?.shippingProvider?.consignmentNo) return;
    const cn = order?.shippingProvider?.trackingNumber || order?.shippingProvider?.consignmentNo;
    try {
      setTrackLoading(true);
      const res = await trackLcsStatus(cn);
      setTracking(res?.data || null);
    } catch (e) {
      setTracking(null);
      // optional: could show a toast here if you want
    } finally {
      setTrackLoading(false);
    }
  };

  // Auto-refresh tracking on page open when a CN is available
  useEffect(() => {
    // Fire once on mount; if CN is already present it will refresh immediately
    const cn = order?.shippingProvider?.trackingNumber || order?.shippingProvider?.consignmentNo;
    // Seed UI from saved packet_list if present so badge shows immediately
    const pkt = order?.shippingProvider?.extra?.packet_list?.[0];
    if (pkt && !tracking) {
      setTracking({
        status: pkt?.title || pkt?.booked_packet_status || '—',
        currentCity: pkt?.origin_city_name || null,
        lastEventAt: pkt?.booking_date || null,
        events: [],
      });
    }
    if (cn) {
      handleRefreshTracking();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Also watch for CN becoming available after mount (e.g., state hydration)
  useEffect(() => {
    const cn = order?.shippingProvider?.trackingNumber || order?.shippingProvider?.consignmentNo;
    if (cn && !tracking && !trackLoading) {
      handleRefreshTracking();
    }
  }, [order?.shippingProvider?.trackingNumber, order?.shippingProvider?.consignmentNo]);

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
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <div className="flex flex-col gap-1">
                  <h1 className="text-2xl font-bold text-gray-800">Order Details</h1>
                  <p className="text-gray-500 text-sm">Order ID: {order._id}</p>
                </div>
                <div className="flex items-center gap-3 flex-wrap">
                  {/* Courier Status Badge */}
                  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-semibold ${courierStatusTheme}`} title="Courier live status">
                    <span className="inline-block w-2 h-2 rounded-full bg-current opacity-70"></span>
                    <span>Courier: {trackLoading ? 'Fetching…' : courierStatus}</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    Updated: {courierLastUpdated ? dateFormatter(courierLastUpdated) : '—'}
                  </span>
                  <span className="px-2 py-1 text-xs rounded bg-gray-100 text-gray-700 capitalize">
                    {order?.source || "web"}
                  </span>
                  <select
                    className="px-3 py-1 text-sm border border-gray-300 rounded-md"
                    value={order.status || "Pending"}
                    disabled
                  >
                    {( ["Pending", "Shipped", "Delivered", "Cancelled"]).map((status) => (
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
                          {Array.isArray(p.selectedVariants) && p.selectedVariants.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {p.selectedVariants.map((v, vIdx) => {
                                const valueText = Array.isArray(v?.values)
                                  ? v.values.join(", ")
                                  : (v?.value ?? "");
                                const imgSrc = typeof v?.image === 'string' ? v.image : v?.image?.url;
                                return (
                                  <span key={vIdx} className="px-2 py-0.5 border capitalize inline-flex items-center gap-1">
                                    {imgSrc ? (
                                      <img
                                        src={imgSrc}
                                        alt={`${v?.name || 'variant'} ${valueText}`}
                                        className="w-5 h-5 object-cover rounded border"
                                        onError={(e) => { e.currentTarget.style.visibility='hidden'; }}
                                      />
                                    ) : null}
                                    <span>
                                      {v?.name}: {valueText || '—'}
                                    </span>
                                  </span>
                                );
                              })}
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

          {/* Courier / Tracking */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 mb-3">
              <h2 className="text-lg font-semibold text-gray-800">Courier</h2>
              <div className="flex items-center gap-2">
                {order?.shippingProvider?.trackingNumber && (
                  <span className="text-xs font-mono px-2 py-1 rounded bg-gray-100 text-gray-800">
                    CN: {order.shippingProvider.trackingNumber}
                  </span>
                )}
                {order?.shippingProvider?.labelUrl && (
                  <a
                    className="text-xs text-blue-600 underline"
                    href={order.shippingProvider.labelUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Slip
                  </a>
                )}
                <button
                  onClick={handleRefreshTracking}
                  className="text-xs px-3 py-1.5 border rounded hover:bg-gray-50 disabled:opacity-50"
                  disabled={!order?.shippingProvider?.trackingNumber && !order?.shippingProvider?.consignmentNo || trackLoading}
                >
                  {trackLoading ? 'Refreshing…' : 'Refresh Status'}
                </button>
              </div>
            </div>

            {tracking ? (
              <div>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-sm px-2 py-0.5 rounded bg-gray-100 text-gray-800">Status: {tracking.status || 'Unknown'}</span>
                  {tracking.currentCity && (
                    <span className="text-sm px-2 py-0.5 rounded bg-gray-100 text-gray-800">Current City: {tracking.currentCity}</span>
                  )}
                  {tracking.lastEventAt && (
                    <span className="text-sm px-2 py-0.5 rounded bg-gray-100 text-gray-800">Last Update: {tracking.lastEventAt}</span>
                  )}
                </div>
                {Array.isArray(tracking.events) && tracking.events.length > 0 ? (
                  <div className="overflow-x-auto">
                    <table className="min-w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-gray-50 text-left text-xs uppercase text-gray-600">
                          <th className="px-3 py-2">Date</th>
                          <th className="px-3 py-2">Status</th>
                          <th className="px-3 py-2">Origin</th>
                          <th className="px-3 py-2">Destination</th>
                          <th className="px-3 py-2">Remarks</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y">
                        {tracking.events.map((e, idx) => (
                          <tr key={idx}>
                            <td className="px-3 py-2">{e?.date || '—'}</td>
                            <td className="px-3 py-2">{e?.status || '—'}</td>
                            <td className="px-3 py-2">{e?.origin || '—'}</td>
                            <td className="px-3 py-2">{e?.destination || '—'}</td>
                            <td className="px-3 py-2">{e?.remarks || '—'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No tracking history available yet.</div>
                )}
              </div>
            ) : (
              <div className="text-sm text-gray-500">Click "Refresh Status" to fetch live courier status.</div>
            )}
          </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetails;
