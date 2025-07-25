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

    const Statuses = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];

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
                                        <table className="w-full border-collapse">
                                            <thead>
                                                <tr className="bg-gray-50">
                                                    <th>Image</th>
                                                    <th>Product</th>
                                                    <th>Price</th>
                                                    <th>Qty</th>
                                                    <th>Variants</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {order.cartSummary?.map((product, idx) => (
                                                    <tr key={idx}>
                                                        <td>
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
                                                        <td>{product.title}</td>
                                                        <td>Rs.{product.price}</td>
                                                        <td>{product.count}</td>
                                                        <td>
                                                            {product.selectedVariants?.length > 0
                                                                ? product.selectedVariants.map((variant, vIdx) => (
                                                                    <span key={vIdx}>{variant.name}: {variant.values.join(", ")}</span>
                                                                ))
                                                                : "-"}
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

export default NewOrders;
