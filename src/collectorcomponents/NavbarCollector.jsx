import { LogOut, PiggyBank, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";

const NavbarCollector = () => {
  const navigate = useNavigate();
  const [collectorData, setCollectorData] = useState({});

  // Get collector data from localStorage
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem("collectorData") || "{}");
    setCollectorData(userData);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("collectorToken");
    localStorage.removeItem("collectorData");
    navigate("/collector/login");
  };

  const images = {
    headerBg:
      "https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2011&q=80",
  };

  return (
    <header className="relative bg-gradient-to-r from-blue-600 to-blue-800 shadow-2xl overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center opacity-20"
        style={{ backgroundImage: `url(${images.headerBg})` }}
      ></div>
      <div className="relative container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-sm">
              <PiggyBank className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">
                Collector Dashboard
              </h1>
              <p className="text-blue-100 mt-1 text-sm">
                Efficient Collection & Customer Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* User Info Section */}
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
              <div className="bg-white/20 p-2 rounded-full">
                <User className="h-5 w-5 text-white" />
              </div>
              <div className="text-right">
                <p className="text-sm text-blue-200">Welcome back,</p>
                <p className="font-bold text-white text-sm">
                  {collectorData?.name || "Collector"}
                </p>
                <p className="text-xs text-blue-300 mt-0.5">Active Collector</p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-4 py-3 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/20 hover:border-white/30 hover:shadow-lg"
            >
              <LogOut className="h-4 w-4" />
              <span className="font-semibold text-sm">Logout</span>
            </button>
          </div>
        </div>

        {/* Additional Collector Info Bar */}
        <div className="flex items-center justify-between mt-4 text-white/80 text-sm">
          <div className="flex items-center gap-6">
            {collectorData?.collectorId && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Collector ID:</span>
                <span className="bg-white/20 px-2 py-1 rounded text-xs">
                  {collectorData.collectorId}
                </span>
              </div>
            )}
            {collectorData?.area && (
              <div className="flex items-center gap-2">
                <span className="font-medium">Area:</span>
                <span className="bg-white/20 px-2 py-1 rounded text-xs">
                  {collectorData.area}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span>Online</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default NavbarCollector;
