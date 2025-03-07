import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-hot-toast";
import { loginAPI } from "../functions/auth";
import { useDispatch } from "react-redux";
import { setUser } from "../store/authSlice";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { motion } from "framer-motion";

const Login = () => {
  const navigateTo = useNavigate();
  const dispatch = useDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const from = location.state?.from || "/";

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await loginAPI({ email, password });
      dispatch(setUser(response?.user));
      toast.success("Login successful");
      navigateTo(from, { replace: true });
    } catch (error) {
      console.error("Error in login", error);
      toast.error(error?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="login" className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="container mx-auto px-0  lg:px-4 py-0 lg:py-8">
        <div className="w-full flex items-center">
          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-main bg-opacity-60 p-6 shadow-lg w-full h-screen lg:w-1/3"
          >
            <h2 className="text-white font-bold text-center text-2xl md:text-3xl py-2">Login</h2>
            <div className="w-20 h-20 mx-auto relative overflow-hidden rounded-full bg-white">
              <img src={"/user.jpg"} alt="profile image" className="w-full h-full object-cover" />
            </div>

            <form className="pt-4 flex flex-col gap-4" onSubmit={handleSubmit}>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="grid">
                <label className="font-medium py-2 text-white">Email *</label>
                <div className="bg-slate-100 p-2 rounded">
                  <input
                    type="email"
                    placeholder="Enter email"
                    name="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full h-full outline-none rounded bg-transparent"
                  />
                </div>
              </motion.div>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="grid">
                <label className="font-medium py-2 text-white">Password *</label>
                <div className="bg-slate-100 p-2 rounded flex items-center">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    name="password"
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full h-full outline-none bg-transparent"
                  />
                  <div
                    className="cursor-pointer text-xl ml-2"
                    onClick={() => setShowPassword((prev) => !prev)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </div>
                </div>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className="bg-main opacity-70 hover:opacity-90 text-white px-6 py-2 w-full rounded transition-all mt-4"
              >
                {loading ? "Logging in..." : "Login"}
              </motion.button>
            </form>

            <p className="my-5 text-center">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-gray-300 hover:text-white opacity-70 hover:opacity-90 hover:underline"
              >
                Sign up
              </Link>
            </p>
          </motion.div>

          {/* E-commerce Design Section (Visible only on md and lg screens) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden lg:flex flex-col w-full lg:w-2/3 h-screen items-center justify-center"
          >
            <motion.img
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              src="/auth-bg.jpg"
              alt="E-commerce Design"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Login;
