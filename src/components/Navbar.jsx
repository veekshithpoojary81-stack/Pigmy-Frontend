import { LogOut, PiggyBank } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import Swal from 'sweetalert2';

const Navbar = () => {
  const navigate = useNavigate();
  const [customerData, setCustomerData] = useState({});

  // Get user data from localStorage
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("customerData") || "{}");
    setCustomerData(userData);
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: "Logout?",
      text: "You will need to login again to access your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, logout!",
      cancelButtonText: "Cancel",
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem("customerToken");
        localStorage.removeItem("customerData");
        navigate("/auth");

        Swal.fire({
          title: "Logged Out!",
          text: "You have been successfully logged out.",
          icon: "success",
          timer: 2000,
          showConfirmButton: false,
        });
      }
    });
  };

  const images = {
    headerBg:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2011&q=80",
  };

  return (
    <header className="relative bg-gradient-to-r from-blue-600 to-blue-800 shadow-2xl overflow-hidden w-screen mx-[-1.3rem] ">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${images.headerBg})` }}
      ></div>
      <div className="relative container mx-auto px-4 py-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <PiggyBank className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white">PigmyXpress</h1>
              <p className="text-blue-100 mt-2 text-lg">
                Smart Savings & Financial Freedom
              </p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <p className="text-sm text-blue-200">Welcome back,</p>
              <p className="font-bold text-white text-lg">
                {customerData?.name || "Valued Customer"}
              </p>
              <p className="text-xs text-blue-300 mt-1">Member since 2024</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-6 py-3 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20 hover:border-white/30"
              >
                <LogOut className="h-5 w-5" />
                <span className="font-semibold">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
