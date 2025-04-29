import { useEffect, useState } from "react";
import { Mail, Lock, User, X, UserCircle } from "lucide-react";
import { userLogin, userSignup } from "../store/slices/userSlice";
import { useAppDispatch, useAppSelector } from "../hooks/reduxHooks";
import { AuthRedirect } from "../components";
import { useNavigate } from "react-router-dom";
//import { IDecodedToken } from "../types";

const AuthView = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState(""); // Added role state
  const [showError, setShowError] = useState(true);
  const navigate = useNavigate();

  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.user);

  const onClickSubmit = async (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    try {
      // Include role in signup
      const action = isLogin 
        ? userLogin({ email, password }) 
        : userSignup({ email, password, username, role });
        
      const response = await dispatch(action).unwrap();
  
      if (response.token) {
        localStorage.setItem("token", response.token);
        if (response.role) {
          
          if (response?.role === "staff admin") {
            navigate("/admin");
          } else if (response?.role === "organizer") {
            navigate("/organizer/eventsAdmin");
          } else if (response?.role === "staff advisor") {
            navigate("/admin");
          }
        } else {
          navigate("/");
        }
      }
    } catch (err) {
      console.error("Authentication failed:", err);
    }
  };

  useEffect(() => {
    if (user.error) {
      setShowError(true);
    }
  }, [user.error]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-6">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">
            {isLogin ? "Login" : "Create an Account"}
          </h2>
          <p className="text-gray-600 mt-2">
            {isLogin
              ? "Enter your credentials to login"
              : "Fill in the details to create your account"}
          </p>
        </div>

        {user.error && showError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm flex justify-between items-center">
            <span>{user.error}</span>
            <button
              onClick={() => setShowError(false)}
              className="text-red-600 hover:text-red-800 transition-colors"
              aria-label="Dismiss error"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <form className="space-y-4">
          {!isLogin && (
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="username"
              >
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  id="username"
                  type="text"
                  placeholder="johndoe"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  onChange={(e) => setUsername(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-gray-700"
              htmlFor="email"
            >
              Email
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="email"
                type="email"
                placeholder="john@example.com"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-gray-700"
              htmlFor="password"
            >
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {/* Role dropdown - only shown during registration */}
          {!isLogin && (
            <div className="space-y-2">
              <label
                className="text-sm font-medium text-gray-700"
                htmlFor="role"
              >
                User Role
              </label>
              <div className="relative">
                <UserCircle className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <select
                  id="role"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none appearance-none bg-white"
                  onChange={(e) => setRole(e.target.value)}
                  value={role}
                >
                  <option value="" disabled>Select your role</option>
                  <option value="organizer">Organizer</option>
                  <option value="staff advisor">Staff</option>
                  <option value="seller">Seller</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                  <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                  </svg>
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors mt-6"
            onClick={onClickSubmit}
            disabled={!isLogin && !role} // Disable signup button if no role is selected
          >
            {isLogin ? "Login" : "Sign Up"}
          </button>

          <div className="text-center text-sm mt-4">
            <span className="text-gray-600">
              {isLogin
                ? "Don't have an account? "
                : "Already have an account? "}
            </span>
            <button
              type="button"
              className="text-blue-600 hover:underline font-medium"
              onClick={() => {
                setIsLogin(!isLogin);
                setShowError(false);
                // setEmail("");
                // setPassword("");
                // setUsername("");
                // setRole("");
              }}
            >
              {isLogin ? "Sign up" : "Login"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AuthView;