import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { FaEye } from "react-icons/fa";
import { BsBullseye } from "react-icons/bs";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { FcViewDetails } from "react-icons/fc";
import { GiMoneyStack } from "react-icons/gi";
import { GrStatusGoodSmall } from "react-icons/gr";
import { IoIosPerson } from "react-icons/io";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { FiCheck } from "react-icons/fi";
import {
  getAllOrders,
  updateOrderStatus,
  getOrdersSearch,
  pushOrdersToLCS,
  trackLcsStatus,
  resolveOrderLcsCity,
} from "../../functions/order";
import { fetchLcsCities } from "../../store/lcsCitiesSlice";
import { truncateTitle } from "../../helpers/truncateTitle";
import { dateFormatter } from "../../utils/dateFormatter";

const AllOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);
  const LIMIT = 20;
  const [previewProduct, setPreviewProduct] = useState(null);
  const [previewOrder, setPreviewOrder] = useState(null);
  const [statusFilter, setStatusFilter] = useState(""); // '', Pending, Shipped, Delivered, Cancelled
  const [sortBy, setSortBy] = useState("orderedAt"); // 'orderedAt' | 'status'
  const [sortOrder, setSortOrder] = useState("desc"); // 'asc' | 'desc'
  const [selectedIds, setSelectedIds] = useState([]);
  const [resolveModal, setResolveModal] = useState({ open: false, orderId: null, cityText: '', suggestions: [], selected: null, saving: false, loading: false });
  const dispatch = useDispatch();
  const lcsCities = useSelector(state => state.lcsCities.items);
  const lcsCitiesLoading = useSelector(state => state.lcsCities.loading);
  const [lcsStatuses, setLcsStatuses] = useState({}); // { [orderId]: { status, lastEventAt } }
  const navigate = useNavigate();
  const location = useLocation();

  const fetchOrders = async (pageNum = 1) => {
    try {
      setLoading(true);
      // Always use server search endpoint to keep logic centralized
      const response = await getOrdersSearch({
        q: debouncedQuery || undefined,
        status: statusFilter || undefined,
        sortBy,
        sortOrder,
        page: pageNum,
        limit: LIMIT,
      });
      setTotalOrders(response?.total || 0);
      setTotalPages(response?.totalPages || 1);
      setOrders(response?.orders || []);
    } catch (error) {
      console.log("Error fetching orders", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTrackRefresh = async (order) => {
    try {
      const cn = order?.shippingProvider?.trackingNumber || order?.shippingProvider?.consignmentNo;
      if (!cn) {
        toast.error('No CN available for this order');
        return;
      }
      toast.loading(`Tracking ${cn}...`, { id: `track-${order._id}` });
      const res = await trackLcsStatus(cn);
      const latest = res?.data;
      if (latest?.status) {
        setLcsStatuses(prev => ({ ...prev, [order._id]: { status: latest.status, lastEventAt: latest.lastEventAt } }));
        toast.success(`Status: ${latest.status}`, { id: `track-${order._id}` });
      } else {
        toast.dismiss(`track-${order._id}`);
      }
    } catch (e) {
      toast.error(e?.response?.data?.message || 'Tracking failed');
    }
  };

  const Statuses = ["Pending", "Shipped", "Delivered", "Cancelled"];

  useEffect(() => {
    setCurrentPage(1);
    fetchOrders(1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Debounce search input
  useEffect(() => {
    const id = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 400);
    return () => clearTimeout(id);
  }, [searchQuery]);

  // Refetch when filters/sort change
  useEffect(() => {
    setCurrentPage(1);
    fetchOrders(1);
  }, [debouncedQuery, statusFilter, sortBy, sortOrder]);

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
      if (pageNum < 1 || pageNum > totalPages || pageNum === currentPage)
        return;
      setCurrentPage(pageNum);
      fetchOrders(pageNum);
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
          Showing <span className="font-semibold">{orders.length}</span> of{" "}
          <span className="font-semibold">{totalOrders}</span> orders (Page{" "}
          {currentPage} of {totalPages})
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

  const handleSearchChange = (e) => setSearchQuery(e.target.value);

  // Server-side filtering used; show orders directly
  const filteredOrders = orders;

  const isSelected = useCallback((id) => selectedIds.includes(id), [selectedIds]);
  const toggleSelect = useCallback((id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }, []);
  const toggleSelectAllVisible = useCallback(() => {
    const visibleIds = filteredOrders.map((o) => o._id);
    const allSelected = visibleIds.every((id) => selectedIds.includes(id));
    setSelectedIds((prev) => (allSelected ? prev.filter((id) => !visibleIds.includes(id)) : Array.from(new Set([...prev, ...visibleIds]))));
  }, [filteredOrders, selectedIds]);

  const handlePushSelected = useCallback(async () => {
    if (selectedIds.length === 0) return;
    try {
      toast.loading(`Pushing ${selectedIds.length} order(s) to LCS...`, { id: 'lcs-push' });
      const res = await pushOrdersToLCS(selectedIds);
      console.log('LCS push results', res);
      const results = Array.isArray(res?.results) ? res.results : [];
      const okCount = results.filter(r => r.ok).length;
      const fail = results.filter(r => !r.ok);
      const failCount = fail.length;
      if (okCount > 0) {
        toast.success(`Pushed ${okCount} / ${selectedIds.length} orders`, { id: 'lcs-push' });
      } else {
        toast.dismiss('lcs-push');
      }
      if (failCount > 0) {
        // If any failure is due to city resolution, show resolver for the first such order
        let cityFail = fail.find(f => f?.code === 'UNSERVICEABLE_CITY');
        // Fallback: detect by error string
        if (!cityFail) {
          const idx = fail.findIndex(f => typeof f?.error === 'string' && f.error.toLowerCase().includes('unserviceable or ambiguous city'));
          if (idx !== -1) cityFail = fail[idx];
        }
        if (cityFail) {
          const rawErr = typeof cityFail.error === 'string' ? cityFail.error : '';
          const cityMatch = rawErr.match(/Unserviceable or ambiguous city:\s*"?([^"\n]+)"?/i);
          const badCity = cityFail?.badCity || (cityMatch ? cityMatch[1] : '');
          let suggestions = Array.isArray(cityFail?.suggestions) ? cityFail.suggestions : [];
          if ((!suggestions || suggestions.length === 0) && Array.isArray(lcsCities) && lcsCities.length > 0) {
            const norm = (s) => String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
            const q = norm(badCity);
            const scoreCity = (c) => {
              const name = c.CityName || c.city_name || c.name || '';
              const cname = norm(name);
              if (!q || !cname) return 0;
              if (cname === q) return 1;
              if (cname.startsWith(q) || q.startsWith(cname)) return 0.95;
              if (cname.includes(q) || q.includes(cname)) return 0.85;
              const at = new Set(cname.split(' ').filter(Boolean));
              const bt = new Set(q.split(' ').filter(Boolean));
              const inter = [...at].filter(x=>bt.has(x)).length;
              const uni = new Set([...at,...bt]).size || 1;
              return (inter/uni)*0.7;
            };
            const mapped = lcsCities.map(c => ({
              id: c.CityID || c.city_id || c.id || c.CityId,
              name: c.CityName || c.city_name || c.name || '',
              raw: c,
            })).filter(x => x.id && x.name);
            suggestions = mapped.map(m => ({...m, score: scoreCity(m.raw)})).filter(s => s.score>0).sort((a,b)=>b.score-a.score).slice(0,10);
          }
          setResolveModal({
            open: true,
            orderId: cityFail.orderId,
            cityText: badCity,
            suggestions,
            selected: suggestions && suggestions[0] ? suggestions[0] : null,
            saving: false,
            loading: false,
          });
          toast.error(`Some orders need city resolution. Please select a city for order #${String(cityFail.orderId || '').slice(-5)}.`);
        } else {
          const firstErr = fail[0]?.error ? (typeof fail[0].error === 'string' ? fail[0].error : JSON.stringify(fail[0].error)) : 'Unknown error';
          toast.error(`Failed ${failCount} order(s): ${firstErr}`);
        }
      }
      // Refresh list to reflect shippingProvider updates
      fetchOrders(currentPage);
      // Clear selection for pushed orders
      setSelectedIds([]);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to push orders to LCS', { id: 'lcs-push' });
    }
  }, [selectedIds, currentPage]);

  const applyResolveCity = useCallback(async () => {
    if (!resolveModal?.orderId || !resolveModal?.selected) return;
    try {
      setResolveModal(m => ({ ...m, saving: true }));
      await resolveOrderLcsCity({ orderId: resolveModal.orderId, lcsCityId: resolveModal.selected.id, lcsCityName: resolveModal.selected.name });
      // Re-push this single order
      const re = await pushOrdersToLCS([resolveModal.orderId]);
      const ok = Array.isArray(re?.results) && re.results.find(r => r.orderId === resolveModal.orderId && r.ok);
      if (ok) {
        toast.success('Order pushed after resolving city');
      } else {
        const firstErr = Array.isArray(re?.results) ? (re.results.find(r => r.orderId === resolveModal.orderId && !r.ok)?.error || 'Unknown') : 'Unknown';
        toast.error(`Re-push failed: ${typeof firstErr === 'string' ? firstErr : JSON.stringify(firstErr)}`);
      }
      setResolveModal({ open: false, orderId: null, cityText: '', suggestions: [], selected: null, saving: false });
      fetchOrders(currentPage);
    } catch (e) {
      toast.error(e?.message || 'Failed to resolve city');
      setResolveModal(m => ({ ...m, saving: false }));
    }
  }, [resolveModal, currentPage]);

  // Ensure cities are loaded when modal opens
  useEffect(() => {
    if (resolveModal.open && (!Array.isArray(lcsCities) || lcsCities.length === 0) && !lcsCitiesLoading) {
      // Load once from frontend public JSON via Redux cache
      dispatch(fetchLcsCities());
    }
    // When modal opens and cities already exist, seed suggestions with all cities
    if (resolveModal.open && Array.isArray(lcsCities) && lcsCities.length > 0) {
      const mapped = lcsCities
        .map(c => ({ id: c.CityID || c.city_id || c.id || c.CityId, name: c.CityName || c.city_name || c.name || '' }))
        .filter(x => x.id && x.name);
      setResolveModal(m => ({ ...m, suggestions: mapped.slice(0, 500), selected: mapped[0] || null }));
    }
  }, [resolveModal.open]);

  // If cities arrive after the modal already opened, seed suggestions too
  useEffect(() => {
    if (!resolveModal.open) return;
    const q = (resolveModal.cityText || '').trim();
    if (q.length >= 2) return; // short/empty case only
    if (Array.isArray(lcsCities) && lcsCities.length > 0) {
      const mapped = lcsCities
        .map(c => ({ id: c.CityID || c.city_id || c.id || c.CityId, name: c.CityName || c.city_name || c.name || '' }))
        .filter(x => x.id && x.name)
        .slice(0, 500);
      setResolveModal(m => ({ ...m, suggestions: mapped, selected: mapped[0] || null }));
    }
  }, [lcsCities]);

  // Debounced local filter for cities
  useEffect(() => {
    if (!resolveModal.open) return;
    const qraw = (resolveModal.cityText || '').trim();
    // If query is short, show the full list (capped) to act like a dropdown
    if (qraw.length < 2) {
      const mappedAll = (Array.isArray(lcsCities)?lcsCities:[])
        .map(c => ({ id: c.CityID || c.city_id || c.id || c.CityId, name: c.CityName || c.city_name || c.name || '' }))
        .filter(x => x.id && x.name)
        .slice(0, 500);
      setResolveModal(m => ({ ...m, suggestions: mappedAll, selected: mappedAll[0] || null, loading: false }));
      return;
    }
    const timer = setTimeout(() => {
      const norm = (s) => String(s||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
      const q = norm(qraw);
      const scoreCity = (name) => {
        const cname = norm(name);
        if (!q || !cname) return 0;
        if (cname === q) return 1;
        if (cname.startsWith(q) || q.startsWith(cname)) return 0.95;
        if (cname.includes(q) || q.includes(cname)) return 0.85;
        const at = new Set(cname.split(' ').filter(Boolean));
        const bt = new Set(q.split(' ').filter(Boolean));
        const inter = [...at].filter(x=>bt.has(x)).length;
        const uni = new Set([...at,...bt]).size || 1;
        return (inter/uni)*0.7;
      };
      const mapped = (Array.isArray(lcsCities)?lcsCities:[]).map(c => ({
        id: c.CityID || c.city_id || c.id || c.CityId,
        name: c.CityName || c.city_name || c.name || '',
      })).filter(x => x.id && x.name);
      const data = mapped.map(m => ({...m, score: scoreCity(m.name)})).filter(s => s.score>0).sort((a,b)=>b.score-a.score).slice(0,10);
      setResolveModal(m => ({ ...m, suggestions: data, selected: data[0] || null, loading: false }));
    }, 350);
    return () => clearTimeout(timer);
  }, [resolveModal.open, resolveModal.cityText, lcsCities]);

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

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:px-5 md:py-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
            All Orders
            <span className="ml-2 text-lg font-medium text-gray-600">
              ({totalOrders} total)
            </span>
          </h1>

          {/* Filters: Search, Status, Sort, and LCS Push */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-3 md:gap-6">
            {/* Left: Search + Filters */}
            <div className="flex flex-col md:flex-row md:items-end gap-3 md:gap-6 w-full">
              <div className="max-w-md w-full">
              <label className="block text-sm text-gray-600 mb-1">
                Search by name or mobile
              </label>
              <input
                type="text"
                placeholder="e.g. Ali or 03xxxxxxxxx"
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 w-full md:w-auto md:flex md:flex-row md:gap-4 md:items-end">
              <div className="w-full">
                <label className="block text-sm text-gray-600 mb-1">
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg"
                >
                  <option value="">All</option>
                  <option value="Pending">Pending</option>
                  <option value="Shipped">Shipped</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
              <div className="w-full">
                <label className="block text-sm text-gray-600 mb-1">
                  Sort by
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg"
                >
                  <option value="orderedAt">Date</option>
                  <option value="status">Status</option>
                </select>
              </div>
              <div className="w-full">
                <label className="block text-sm text-gray-600 mb-1">
                  Order
                </label>
                <select
                  value={sortOrder}
                  onChange={(e) => setSortOrder(e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-300 rounded-lg"
                >
                  <option value="desc">Desc</option>
                  <option value="asc">Asc</option>
                </select>
              </div>
              </div>
            </div>
            {/* Right: Bulk Push Action */}
            <div className="w-full md:w-auto md:ml-auto">
              <button
                className="w-full md:w-auto px-3 py-2 text-sm rounded-md border bg-primary text-white disabled:opacity-50"
                onClick={handlePushSelected}
                disabled={selectedIds.length === 0}
                title={selectedIds.length === 0 ? 'Select orders to push' : 'Push selected orders to LCS'}
              >
                Push selected to LCS ({selectedIds.length})
              </button>
            </div>
          </div>
        </div>

        {/* Resolve City Modal */}
        {resolveModal.open && (
        <div className="fixed inset-0 z-[20000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setResolveModal({ open: false, orderId: null, cityText: '', suggestions: [], selected: null, saving: false, loading: false })} />
          <div className="relative z-[20001] bg-white rounded-lg shadow-xl w-full max-w-lg p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold">Resolve Destination City</h3>
              <button className="px-2 py-1 rounded hover:bg-gray-100" onClick={() => setResolveModal({ open: false, orderId: null, cityText: '', suggestions: [], selected: null, saving: false, loading: false })}>✕</button>
            </div>
            <p className="text-sm text-gray-600 mb-3">Order ID: <span className="font-mono">{resolveModal.orderId}</span></p>
            <div className="mb-3">
              <label className="block text-xs text-gray-500 mb-1">Search city</label>
              <div className="flex gap-2">
                <input
                  className="flex-1 px-3 py-2 border rounded"
                  placeholder="Type to search LCS cities"
                  value={resolveModal.cityText}
                  onChange={(e) => setResolveModal(m => ({ ...m, cityText: e.target.value }))}
                />
                {(resolveModal.loading || lcsCitiesLoading) && <span className="text-xs text-gray-500 self-center">Searching…</span>}
              </div>
            </div>
            <div className="mt-2">
              <div className="max-h-72 overflow-auto border rounded">
                {resolveModal.suggestions.map((s, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setResolveModal(m => ({ ...m, selected: s }))}
                    className={`w-full text-left px-3 py-2 border-b last:border-b-0 hover:bg-blue-50`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div>
                        <div className="font-medium">{s.name}</div>
                        {typeof s.score === 'number' && <div className="text-xs text-gray-500">Score: {s.score}</div>}
                      </div>
                      {resolveModal.selected?.id === s.id && (
                        <FiCheck className="text-green-600 text-lg" />
                      )}
                    </div>
                  </button>
                ))}
                {(!resolveModal.suggestions || resolveModal.suggestions.length === 0) && !resolveModal.loading && (
                  <div className="text-sm text-gray-500 p-3">No results. Try another spelling.</div>
                )}
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button className="px-3 py-1.5 rounded border" onClick={() => setResolveModal({ open: false, orderId: null, cityText: '', suggestions: [], selected: null, saving: false, loading: false })}>Cancel</button>
              <button disabled={!resolveModal.selected || resolveModal.saving} className="px-3 py-1.5 rounded bg-secondary text-primary disabled:opacity-50" onClick={applyResolveCity}>
                {resolveModal.saving ? 'Saving…' : 'Save & Push'}
              </button>
            </div>
          </div>
        </div>
      )}

        {/* Orders Table Container */}
        <div className="bg-white rounded-lg shadow-sm">
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
            <div>
              {/* Mobile: Card list */}
              <div className="md:hidden divide-y">
                {filteredOrders.map((order) => (
                  <div key={order._id} className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <input
                        type="checkbox"
                        checked={isSelected(order._id)}
                        onChange={() => toggleSelect(order._id)}
                      />
                      <span className="text-xs text-gray-500">Select</span>
                    </div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-mono text-[11px] text-gray-600">
                        {dateFormatter(order.orderedAt)}
                      </span>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium capitalize ${
                          order?.source === "web"
                            ? "bg-blue-100 text-blue-700"
                            : order?.source === "mobile"
                            ? "bg-green-100 text-green-700"
                            : order?.source === "manual"
                            ? "bg-purple-100 text-purple-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                        title={order?.source || "unknown"}
                      >
                        {order?.source || "unknown"}
                      </span>
                    </div>
                    <div className="text-sm text-gray-900">
                      <div className="font-semibold truncate">
                        {order?.orderedBy?.username ||
                          order?.shippingAddress?.fullName}
                      </div>
                      <div className="text-xs text-gray-600 truncate">
                        {order?.shippingAddress?.city || "—"}
                      </div>
                    </div>
                    <div className="mt-1 text-xs text-gray-700 truncate">
                      <span className="font-medium">
                        {order.cartSummary?.length || 0} item(s)
                      </span>
                      {order.cartSummary && order.cartSummary.length > 0 && (
                        <span className="block truncate">
                          {truncateTitle(order.cartSummary[0].title, 40)}
                          {order.cartSummary.length > 1
                            ? ` +${order.cartSummary.length - 1} more`
                            : ""}
                        </span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-xs text-gray-700">
                        Delivery: Rs.{order?.deliveryCharges}
                      </span>
                      <span className="text-sm font-bold text-green-600">
                        Rs.{order?.totalPrice}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-gray-700">
                      {order?.shippingProvider?.pushed ? (
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-700">
                            {order?.shippingProvider?.provider?.toUpperCase() || 'LCS'}
                          </span>
                          {order?.shippingProvider?.trackingNumber && (
                            <span className="font-mono">
                              {order.shippingProvider.trackingNumber}
                            </span>
                          )}
                          {order?.shippingProvider?.labelUrl && (
                            <a
                              className="text-blue-600 hover:underline"
                              href={order.shippingProvider.labelUrl}
                              target="_blank"
                              rel="noreferrer"
                            >
                              Label
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">No shipment</span>
                      )}
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <select
                        className="flex-1 py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
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
                      <button
                        className="inline-flex items-center justify-center p-2"
                        title="View details"
                        onClick={() =>
                          navigate(`/admin/orders/${order._id}`, {
                            state: { order, from: "/admin/orders" },
                          })
                        }
                      >
                        <FaEye size={16} className="text-gray-700" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              {/* Desktop: Table */}
              <div className="hidden md:block">
                <div className="overflow-x-auto relative">
                <table className="w-full table-auto border-collapse bg-white min-w-[980px]">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr className="border-b border-gray-200">
                      <th className="px-2 py-1 w-10 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                        <input
                          type="checkbox"
                          onChange={toggleSelectAllVisible}
                          checked={filteredOrders.length > 0 && filteredOrders.every(o => selectedIds.includes(o._id))}
                          indeterminate={filteredOrders.some(o => selectedIds.includes(o._id)) && !filteredOrders.every(o => selectedIds.includes(o._id))}
                        />
                      </th>
                      <th className="px-2 py-1 w-28 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                        Date
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                        <div className="flex items-center gap-2">
                          <IoIosPerson size={20} className="text-gray-500" />
                          <span>Customer</span>
                        </div>
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                        <span>Source</span>
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                        <div className="flex items-center gap-2">
                          <GrStatusGoodSmall
                            size={20}
                            className="text-gray-500"
                          />
                          <span>Status</span>
                        </div>
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200 max-w-[160px]">
                        <div className="flex items-center gap-2">
                          <FcViewDetails size={20} />
                          <span>Products</span>
                        </div>
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200 hidden lg:table-cell">
                        <div className="flex items-center gap-2">
                          <FaMoneyBillTrendUp
                            size={20}
                            className="text-gray-500"
                          />
                          <span>Delivery</span>
                        </div>
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                        <div className="flex items-center gap-2">
                          <GiMoneyStack size={20} className="text-gray-500" />
                          <span>Total</span>
                        </div>
                      </th>
                      <th className="px-3 py-3 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider border-r border-gray-200">
                        <div className="flex items-center gap-2">
                          <span>Shipping</span>
                        </div>
                      </th>
                      <th className="px-1 py-3 w-12 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider sticky right-0 bg-white z-20">
                        <span
                          className="inline-flex items-center justify-center w-full"
                          title="View"
                        >
                          <BsBullseye
                            size={24}
                            className=" font-extrabold text-primary"
                          />
                        </span>
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
                          <td className="px-2 py-3 text-center border-r border-gray-200">
                            <input
                              type="checkbox"
                              checked={isSelected(order._id)}
                              onChange={() => toggleSelect(order._id)}
                            />
                          </td>
                          <td className="px-2 py-3 text-sm leading-tight text-gray-900 border-r border-gray-200 text-center">
                            <span className="font-mono flex justify-center text-xs">
                              {dateFormatter(order.orderedAt)}
                            </span>
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-900 border-r border-gray-200 truncate">
                            <div className="font-medium">
                              {order?.orderedBy?.username ||
                                `${order?.shippingAddress?.fullName}`}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-900 border-r border-gray-200">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                                order?.source === "web"
                                  ? "bg-blue-100 text-blue-700"
                                  : order?.source === "mobile"
                                  ? "bg-green-100 text-green-700"
                                  : order?.source === "manual"
                                  ? "bg-purple-100 text-purple-700"
                                  : "bg-gray-100 text-gray-700"
                              }`}
                              title={order?.source || "unknown"}
                            >
                              {order?.source || "unknown"}
                            </span>
                          </td>
                          <td className="px-2 py-1 text-sm border-r border-gray-200">
                            <select
                              className="py-1 text-xs border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
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
                          <td className="px-3 py-3 border-r border-gray-200 max-w-[160px]">
                            <div className="text-sm text-gray-800 truncate">
                              <span className="font-semibold text-xs">
                                {order.cartSummary?.length || 0} item(s)
                              </span>
                              {order.cartSummary &&
                                order.cartSummary.length > 0 && (
                                  <span className="block text-gray-600 text-sm truncate">
                                    {truncateTitle(
                                      order.cartSummary[0].title,
                                      40
                                    )}
                                    {order.cartSummary.length > 1
                                      ? ` +${order.cartSummary.length - 1} more`
                                      : ""}
                                  </span>
                                )}
                            </div>
                          </td>
                          <td className="px-3 py-3 text-sm font-semibold text-gray-900 border-r border-gray-200 hidden lg:table-cell">
                            Rs.{order?.deliveryCharges}
                          </td>
                          <td className="px-3 py-3 text-sm font-bold text-green-600">
                            Rs.{order?.totalPrice}
                          </td>
                          <td className="px-3 py-3 text-sm text-gray-900 border-r border-gray-200">
                            {order?.shippingProvider?.pushed ? (
                              <div className="flex items-center gap-2">
                                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                                  {order?.shippingProvider?.provider?.toUpperCase() || 'LCS'}
                                </span>
                                {order?.shippingProvider?.trackingNumber && (
                                  <span className="text-xs text-gray-700 font-mono" title="Tracking number">
                                    {order.shippingProvider.trackingNumber}
                                  </span>
                                )}
                                {order?.shippingProvider?.labelUrl && (
                                  <a
                                    className="text-xs text-blue-600 hover:underline"
                                    href={order.shippingProvider.labelUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                  >
                                    Label
                                  </a>
                                )}
                                <button
                                  className="text-xs px-2 py-0.5 border rounded hover:bg-gray-50"
                                  onClick={() => handleTrackRefresh(order)}
                                  title="Refresh courier status"
                                >
                                  Refresh
                                </button>
                                {lcsStatuses[order._id]?.status && (
                                  <span
                                    className={`inline-block w-2.5 h-2.5 rounded-full ${(() => {
                                      const s = String(lcsStatuses[order._id].status || '').toLowerCase();
                                      if (s.includes('deliver')) return 'bg-green-500';
                                      if (s.includes('cancel')) return 'bg-red-500';
                                      if (s.includes('return') || s.includes('rts')) return 'bg-orange-500';
                                      if (s.includes('out for') || s.includes('transit') || s.includes('ship')) return 'bg-blue-500';
                                      return 'bg-gray-400';
                                    })()}`}
                                    title={`Status: ${lcsStatuses[order._id].status}${lcsStatuses[order._id].lastEventAt ? `\nUpdated: ${lcsStatuses[order._id].lastEventAt}` : ''}`}
                                  />
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </td>
                          <td className="px-1 py-3 text-center sticky right-0 bg-white z-20">
                            <button
                              className="inline-flex items-center justify-center p-2"
                              title="View details"
                              onClick={() =>
                                navigate(`/admin/orders/${order._id}`, {
                                  state: { order, from: "/admin/orders" },
                                })
                              }
                            >
                              <FaEye size={16} className="text-gray-700" />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      {/* Pagination under the table, always visible without horizontal scroll */}
      <div className="max-w-7xl mx-auto mt-4">{renderPagination()}</div>
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
                      {previewProduct.selectedVariants.map((variant, idx) => {
                        const valueText = Array.isArray(variant?.values)
                          ? variant.values.join(", ")
                          : (variant?.value ?? "");
                        return (
                          <li key={idx}>
                            <span className="font-medium">{variant?.name}:</span> {valueText || '—'}
                          </li>
                        );
                      })}
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
