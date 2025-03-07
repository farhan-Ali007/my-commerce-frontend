import { lazy, Suspense, useEffect, useState } from "react";
import { Toaster } from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import Footer from "./components/Footer";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import { getUserAPI } from "./functions/auth";
import { setUser } from "./store/authSlice";
import NotFound from "./Pages/NotFound";

const Home = lazy(() => import("./Pages/Home"));
const Signup = lazy(() => import("./Pages/Signup"));
const ProductsBySub = lazy(() => import('./Pages/product/ProductsBySub'))
const ProductsByBrand = lazy(() => import('./Pages/product/ProductsByBrand'))
const Login = lazy(() => import("./Pages/Login"));
const CategoryPage = lazy(() => import("./Pages/CategoryPage"));
const SingleProduct = lazy(() => import("./Pages/product/SingleProduct"));
const Cart = lazy(() => import("./Pages/Cart"));
const Checkout = lazy(() => import("./Pages/Checkout"));
const Shop = lazy(() => import("./Pages/Shop"));
const History = lazy(() => import("./Pages/user/History"));
const AdminDashboard = lazy(() => import("./Pages/admin/AdminDashboard"));
const CreateProduct = lazy(() => import("./Pages/admin/CreateProduct"));
const EditProduct = lazy(() => import("./Pages/admin/EditProduct"));

const App = () => {
  const navigateTo = useNavigate();
  const dispatch = useDispatch();
  const location = useLocation(); // Get current route
  const { user } = useSelector((state) => state.auth);
  console.log("Current User---->", user?.username);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const response = await getUserAPI();
        dispatch(setUser(response?.user));
      } catch (error) {
        console.log("Error fetching user", error);
        if (window.location.pathname !== "/signup") {
          navigateTo("/login");
        }
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [dispatch, navigateTo]);


  if (loading) {
    return (
      <div className="w-screen h-screen flex justify-center items-center">
        <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-main opacity-90"></div>
      </div>
    );
  }

  // List of pages where Navbar should be hidden
  const hiddenNavbarRoutes = ["/signup", "/login",];

  return (
    <>
      <div className="flex flex-col">
        {/* Conditionally render Navbar */}
        {!hiddenNavbarRoutes.includes(location.pathname) && <Navbar />}

        <Suspense
          fallback={
            <div className="w-screen h-screen flex justify-center items-center">
              <div className="animate-spin rounded-full h-32 w-32 border-t-4 border-main opacity-90"></div>
            </div>
          }
        >
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/signup" element={!user ? <Signup /> : <Home />} />
            <Route path="/login" element={!user ? <Login /> : <Home />} />
            <Route path="/product/:slug" element={<SingleProduct />} />
            <Route path="/cart" element={<Cart />} />

            {/* Protected Routes for Logged-in Users */}
            <Route >
              <Route path="/cart/checkout" element={<Checkout />} />
              <Route path="/order-history" element={<History />} />
            </Route>

            <Route path="/shop" element={<Shop />} />
            <Route path="/category/:categorySlug/subcategory/:subcategorySlug" element={<ProductsBySub />} />
            <Route path="/category/:categorySlug" element={<CategoryPage />} />
            <Route path="/products/:brand" element={<ProductsByBrand />} />

            {/* Protected Routes for Admin Only */}
            <Route element={<AdminRoute />}>
              <Route path="/admin-dashboard" element={<AdminDashboard />} />
              <Route path="/add-product" element={<CreateProduct />} />
              <Route path="/edit-product/:slug" element={<EditProduct />} />
            </Route>

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
        <Toaster position="top-center" />
      </div>
      <Footer />
    </>
  );
};

export default App;
