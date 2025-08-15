import React, { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import {
  ResponsiveContainer,
  LineChart as RLineChart,
  Line,
  AreaChart as RAreaChart,
  Area,
  BarChart as RBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart as RPieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  getDashboardAnalytics,
  getOrdersAnalytics,
  getOrderStatusSummary,
} from '../../functions/analytics';

const StatCard = ({ title, value, sub }) => (
  <div className="p-4 rounded-lg border bg-white shadow-sm">
    <div className="text-gray-600 text-sm">{title}</div>
    <div className="text-2xl font-bold text-secondary">{value}</div>
    {sub && <div className="text-xs text-gray-500 mt-1">{sub}</div>}
  </div>
);

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [kpis, setKpis] = useState(null);
  const [topProducts, setTopProducts] = useState([]);
  const [lowStockCount, setLowStockCount] = useState(0);

  const [range, setRange] = useState('30d'); // '7d' | '30d' | 'all'
  const [chartMode, setChartMode] = useState('line'); // 'line' | 'area'

  const [series, setSeries] = useState([]); // orders+revenue time series
  const [statusSummary, setStatusSummary] = useState([]);
  const colors = ["#0ea5e9","#10b981","#f59e0b","#ef4444","#6366f1","#14b8a6"];

  const computeRange = (key) => {
    const end = dayjs();
    if (key === '7d') {
      return { from: end.subtract(6, 'day').startOf('day'), to: end.endOf('day'), interval: 'day' };
    }
    if (key === '30d') {
      return { from: end.subtract(29, 'day').startOf('day'), to: end.endOf('day'), interval: 'day' };
    }
    // "all": approximate to last 12 months for charts
    return { from: end.subtract(11, 'month').startOf('month'), to: end.endOf('day'), interval: 'month' };
  };

  // Load static dashboard (KPIs, top products)
  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await getDashboardAnalytics();
        setKpis(data?.kpis || null);
        setTopProducts(data?.topProducts || []);
        setLowStockCount(data?.lowStockCount || 0);
      } catch (e) {
        setError('Failed to load analytics');
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, []);

  // Load dynamic charts per range
  useEffect(() => {
    const loadRange = async () => {
      try {
        const { from, to, interval } = computeRange(range);
        const orders = await getOrdersAnalytics({ from: from.toISOString(), to: to.toISOString(), interval });
        setSeries(orders?.data || orders?.timeSeries || []);
        const status = await getOrderStatusSummary({ from: from.toISOString(), to: to.toISOString() });
        setStatusSummary(status?.summary || []);
      } catch (e) {
        // fallback
        setSeries([]);
        setStatusSummary([]);
      }
    };
    loadRange();
  }, [range]);

  const formattedSeries = useMemo(() => (
    series.map(d => ({
      date: range === 'all' ? dayjs(d.date).format('MMM YYYY') : dayjs(d.date).format('DD MMM'),
      orders: d.orders,
      revenue: d.revenue,
      itemsSold: d.itemsSold,
    }))
  ), [series, range]);

  return (
    <div className="min-h-screen p-3 md:p-6 bg-gray-50">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Dashboard</h1>
          <div className="flex items-center gap-2">
            <div className="inline-flex rounded overflow-hidden border">
              <button
                className={`px-3 py-1 text-sm ${chartMode === 'line' ? 'bg-secondary text-white' : 'bg-white'}`}
                onClick={() => setChartMode('line')}
              >Line</button>
              <button
                className={`px-3 py-1 text-sm ${chartMode === 'area' ? 'bg-secondary text-white' : 'bg-white'}`}
                onClick={() => setChartMode('area')}
              >Area</button>
            </div>
            <div className="inline-flex rounded overflow-hidden border">
              <button className={`px-3 py-1 text-sm ${range === '7d' ? 'bg-gray-800 text-white' : 'bg-white'}`} onClick={() => setRange('7d')}>Last 7d</button>
              <button className={`px-3 py-1 text-sm ${range === '30d' ? 'bg-gray-800 text-white' : 'bg-white'}`} onClick={() => setRange('30d')}>Last 30d</button>
              <button className={`px-3 py-1 text-sm ${range === 'all' ? 'bg-gray-800 text-white' : 'bg-white'}`} onClick={() => setRange('all')}>All time</button>
            </div>
          </div>
        </div>

        {error && <div className="p-3 rounded bg-red-50 text-red-700 border border-red-200">{error}</div>}
        {loading && <div className="p-3 rounded bg-white shadow-sm">Loading analytics...</div>}

        {!loading && (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <StatCard title="Today Orders" value={kpis?.today?.orders ?? 0} sub={`AOV Rs.${Math.round(kpis?.today?.avgOrderValue || 0)}`} />
              <StatCard title="Today Revenue" value={`Rs.${Math.round(kpis?.today?.revenue || 0)}`} sub={`Items ${kpis?.today?.itemsSold || 0}`} />
              <StatCard title="Last 7d Orders" value={kpis?.last7?.orders ?? 0} sub={`Revenue Rs.${Math.round(kpis?.last7?.revenue || 0)}`} />
              <StatCard title="All-time Revenue" value={`Rs.${Math.round(kpis?.allTime?.revenue || 0)}`} sub={`Orders ${kpis?.allTime?.orders || 0}`} />
            </div>

            {/* Charts Row: Revenue + Orders */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border bg-white shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold text-gray-800">Revenue ({range === 'all' ? 'Last 12m' : 'Daily'})</h2>
                  <div className="text-xs text-gray-500">{range === 'all' ? 'Monthly' : 'Daily'}</div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    {chartMode === 'line' ? (
                      <RLineChart data={formattedSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} dot={false} />
                      </RLineChart>
                    ) : (
                      <RAreaChart data={formattedSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.6}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Area type="monotone" dataKey="revenue" stroke="#6366f1" fillOpacity={1} fill="url(#revGrad)" />
                      </RAreaChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="p-4 rounded-lg border bg-white shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="font-semibold text-gray-800">Orders ({range === 'all' ? 'Last 12m' : 'Last period'})</h2>
                  <div className="text-xs text-gray-500">{range === 'all' ? 'Monthly' : 'Daily'}</div>
                </div>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RBarChart data={formattedSeries} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="orders" fill="#0ea5e9" radius={[4,4,0,0]} />
                    </RBarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Status Pie + Top Products */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg border bg-white shadow-sm">
                <h2 className="font-semibold text-gray-800 mb-3">Orders by Status</h2>
                {statusSummary?.length ? (
                  <div className="h-72 flex items-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <RPieChart>
                        <Tooltip />
                        <Legend />
                        <Pie
                          data={statusSummary.map((s) => ({ name: s.status, value: s.count }))}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={90}
                          innerRadius={40}
                          label
                        >
                          {statusSummary.map((s, idx) => (
                            <Cell key={`cell-${idx}`} fill={colors[idx % colors.length]} />
                          ))}
                        </Pie>
                      </RPieChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-sm text-gray-500">No data</div>
                )}
              </div>
              <div className="p-4 rounded-lg border bg-white shadow-sm">
                <h2 className="font-semibold text-gray-800 mb-2">Top Products</h2>
                <ul className="divide-y">
                  {topProducts?.length ? topProducts.map(p => (
                    <li key={p._id} className="py-2 flex items-center justify-between">
                      <span className="text-sm text-gray-800 line-clamp-1">{p.title}</span>
                      <span className="text-xs text-gray-500">Sold: {p.sold ?? 0} | Stock: {p.stock ?? 0}</span>
                    </li>
                  )) : <li className="text-sm text-gray-500">No products</li>}
                </ul>
                <div className="mt-3 text-xs text-gray-600">Low stock items: {lowStockCount}</div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
