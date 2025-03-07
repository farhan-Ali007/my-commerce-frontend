import React, { useEffect, useState } from 'react';
import { getRecentOrders, updateOrderStatus } from '../../functions/order';
import { toast } from 'react-hot-toast'

const NewOrders = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

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

    const Statuses = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];

    useEffect(() => {
        fetchAllOrders();
    }, []);

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
            toast.success(`Status updated to ${newStatus}`)
        } catch (error) {
            console.log("Error updating order status", error);
            toast.error(error?.message || "Error in updating order status")
        }
    };

    // Filter orders by search query (order ID)
    const filteredOrders = orders.filter(order =>
        order._id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="container mx-auto p-6 text-center">
            <h1 className="text-3xl font-bold mb-6 text-main">New Orders [{`${orders.length}`}]</h1>

            {/* Search Bar */}
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Search Orders by Order ID"
                    value={searchQuery}
                    onChange={handleSearchChange}
                    className="px-4 py-2 w-full sm:w-1/2 border rounded-full focus:ring-1 ring-main focus:outline-none"
                />
            </div>

            {/* Orders Table */}
            {loading ? (
                <p>Loading...</p>
            ) : filteredOrders.length === 0 ? (
                <p>No orders available.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="min-w-full table-auto border-collapse border-1 border-black">
                        <thead>
                            <tr>
                                <th className="px-4 py-2 border">Order ID</th>
                                <th className="px-4 py-2 border">Customer</th>
                                <th className="px-4 py-2 border">Order Status</th>
                                <th className="px-4 py-2 border">Products</th>
                                <th className="px-4 py-2 border">Total Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredOrders.map((order) => (
                                <tr key={order._id}>
                                    <td className="px-4 py-2 border">{order._id}</td>
                                    <td className="px-4 py-2 border">{order?.orderedBy?.username || 'N/A'}</td>
                                    <td className="px-4 py-2 border">
                                        <select
                                            className="px-4 py-2 border rounded-md"
                                            value={order.status || 'Pending'}
                                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                        >
                                            {Statuses.map((status, index) => (
                                                <option key={index} value={status}>
                                                    {status}
                                                </option>
                                            ))}
                                        </select>
                                    </td>

                                    <td className="px-4 py-2 border">
                                        <ul>
                                            {order.cartSummary?.map((product) => (
                                                <li key={product._id} className="mb-4">
                                                    <div>
                                                        <strong className="text-main font-bold">{product.product?.title}</strong>
                                                    </div>
                                                    <div>Price: Rs.{product.salePrice || product.price}</div>
                                                    <div>count: {product?.count}</div>
                                                </li>
                                            ))}
                                        </ul>
                                    </td>
                                    <td className="px-4 py-2 border">
                                        Rs.{order?.totalPrice}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default NewOrders;
