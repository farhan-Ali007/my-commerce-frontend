import { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { signupAPI } from "../functions/auth";
import { setUser } from "../store/authSlice";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { motion } from "framer-motion";

const Signup = () => {
  const dispatch = useDispatch();
  const navigateTo = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("username", username);
      formData.append("email", email);
      formData.append("password", password);

      const response = await signupAPI(formData);
      dispatch(setUser(response?.newUser));
      toast.success("Signup successful");
      navigateTo(from, { replace: true });
    } catch (error) {
      console.error("Error during signup:", error);
      toast.error(error?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="signup" className=" flex items-center justify-center bg-gray-50">
      <div className="container mx-auto  px-0 lg:px-4 py-0 lg:py-8">
        <div className="w-full flex items-center">
          {/* Form Section */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-main bg-opacity-60 p-6 shadow-lg w-full lg:w-1/3"
          >
            <h2 className="text-white font-bold text-center text-2xl md:text-3xl py-2">Signup</h2>
            <div className="w-20 h-20 mx-auto relative overflow-hidden rounded-full bg-white">
              <img src={"/user.jpg"} alt="profile image" className="w-full h-full object-cover" />
            </div>

            <form className="pt-4 flex flex-col gap-4" onSubmit={handleSubmit}>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="grid"
              >
                <label className="font-medium py-2 text-white">Name *</label>
                <div className="bg-slate-100 p-2 rounded">
                  <input
                    type="text"
                    placeholder="Enter your name"
                    name="name"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="w-full h-full rounded outline-none bg-transparent"
                  />
                </div>
              </motion.div>

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="grid"
              >
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

              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="grid"
              >
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
                {loading ? "Signing up..." : "Sign Up"}
              </motion.button>
            </form>

            <p className="my-5 text-center">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-gray-300 hover:text-white opacity-70 hover:opacity-90 hover:underline"
              >
                Login
              </Link>
            </p>
          </motion.div>

          {/* E-commerce Design Section (Visible only on md and lg screens) */}
          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="hidden lg:flex flex-col w-full  lg:w-2/3  h-[101.6vh]  items-center justify-center"
          >
            <motion.img
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 0.8 }}
              src="/auth-bg.jpg" // Replace with your e-commerce design image
              alt="E-commerce Design"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Signup;