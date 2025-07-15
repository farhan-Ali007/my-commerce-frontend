import React, { useEffect, useState } from 'react';
import { getRecentOrders, updateOrderStatus } from '../../functions/order';
import { toast } from 'react-hot-toast'
import { IoMdCall } from "react-icons/io";
import { GiMoneyStack } from "react-icons/gi";
import { MdAlternateEmail, MdNotes } from "react-icons/md";
import { FaMoneyBillTrendUp } from "react-icons/fa6";
import { FcViewDetails } from "react-icons/fc";
import { IoIosPerson } from "react-icons/io";
import { GrStatusGoodSmall } from "react-icons/gr";
import SimpleBar from 'simplebar-react';

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
                <SimpleBar
                    forceVisible="x"
                    autoHide={false}
                    style={{
                        maxWidth: '100%',
                        height: '320px', // or your preferred height
                        overflowY: 'auto',
                        overflowX: 'auto',
                    }}
                >
                    <table className="min-w-[2000px] border-collapse border-black table-auto border-1">
                        <thead>
                            <tr>
                                <th className="px-6 py-2 border">
                                    <span>Order ID</span>
                                </th>
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
                            {filteredOrders.map((order, index) => (
                                <tr key={order._id}>
                                    <td className="px-4 py-2 border">{order._id}</td>
                                    <td className="px-4 py-2 border">
                                        {order?.orderedBy?.username ||
                                            `${order?.shippingAddress?.fullName}`}
                                    </td>
                                    <td className="px-4 py-2 border">
                                        <select
                                            className="px-4 py-2 border rounded-md"
                                            value={order.status || "Pending"}
                                            onChange={(e) => handleStatusChange(order._id, e.target.value)}
                                        >
                                            {Statuses.map((status, index) => (
                                                <option key={index} value={status}>
                                                    {status}
                                                </option>
                                            ))}
                                        </select>
                                    </td>
                                    <td className="px-4 py-2 border min-w-[500px] max-w-[900px]">
                                        <ul className="grid grid-cols-2 gap-2 list-none p-0 m-0">
                                            {order.cartSummary?.map((product) => (
                                                <li
                                                    key={product._id}
                                                    className="bg-gray-200 border border-primary rounded-lg p-2 mb-2"
                                                >
                                                    {/* Product Basic Info */}
                                                    <div className="mb-2">
                                                        <strong className="text-xs font-bold text-main">
                                                            {product?.title}
                                                        </strong>
                                                    </div>
                                                    <div className="flex items-center gap-4 mb-2 text-sm">
                                                        <span className="text-primary ">
                                                            Price:{" "}
                                                            <span className="font-semibold">
                                                                Rs.{product.salePrice || product.price}
                                                            </span>
                                                        </span>
                                                        <span className="text-primary">
                                                            Quantity:{" "}
                                                            <span className="font-semibold ">
                                                                {product?.count}
                                                            </span>
                                                        </span>
                                                    </div>
                                                    {/* Variants Section */}
                                                    {product.selectedVariants &&
                                                        product.selectedVariants.length > 0 && (
                                                            <div className="pt-3 mt-3 border-t border-gray-200">
                                                                <div className="flex flex-col gap-2">
                                                                    {product.selectedVariants.map((variant) => (
                                                                        <div
                                                                            key={variant.name}
                                                                            className="flex items-start gap-2"
                                                                        >
                                                                            <span className="font-semibold text-gray-900 capitalize min-w-[80px]">
                                                                                {variant.name}:
                                                                            </span>
                                                                            <div className="flex flex-wrap gap-1.5">
                                                                                {variant.values.map(
                                                                                    (value, valueIndex) => (
                                                                                        <span
                                                                                            key={`${variant.name}-${valueIndex}`}
                                                                                            className="px-2.5 py-1 text-xs font-medium capitalize bg-main/10 text-main rounded-full border border-main/20"
                                                                                        >
                                                                                            {value}
                                                                                        </span>
                                                                                    )
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                </li>
                                            ))}
                                        </ul>
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
                            ))}
                        </tbody>
                    </table>
                </SimpleBar>
            )}
        </div>
    );
};

export default NewOrders;
