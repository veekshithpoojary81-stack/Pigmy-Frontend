import { PiggyBank, Mail, Phone, MapPin, Shield, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FooterCollector = () => {
  const navigate = useNavigate();

  const handleCustomerLogin = () => {
    navigate("/auth");
  };

  const handleAdminLogin = () => {
    navigate("/admin/login");
  };

  return (
    <footer className="bg-gradient-to-r from-gray-900 to-blue-900 text-white py-12 mt-16 mb-[-5rem]">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-white/20 p-2 rounded-xl">
                <PiggyBank className="h-6 w-6 text-white" />
              </div>
              <h3 className="text-xl font-bold">PigmyXpress</h3>
            </div>
            <p className="text-gray-300 leading-relaxed">
              Empowering collectors with efficient tools for seamless customer management 
              and financial operations. Your trusted partner in community banking.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Users className="h-5 w-5 mr-2" />
              Collector Resources
            </h3>
            <div className="space-y-3">
              <button 
                onClick={() => navigate("/collector/customers")} 
                className="block text-gray-300 hover:text-white transition-colors text-left hover:translate-x-1 transition-transform"
              >
                Customer Management
              </button>
              <button 
                onClick={() => navigate("/collector/withdrawals")} 
                className="block text-gray-300 hover:text-white transition-colors text-left hover:translate-x-1 transition-transform"
              >
                Withdrawal Processing
              </button>
              <button 
                onClick={() => navigate("/collector/profile")} 
                className="block text-gray-300 hover:text-white transition-colors text-left hover:translate-x-1 transition-transform"
              >
                Profile Settings
              </button>
              <button 
                onClick={() => navigate("/collector/reports")} 
                className="block text-gray-300 hover:text-white transition-colors text-left hover:translate-x-1 transition-transform"
              >
                Daily Reports
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <Shield className="h-5 w-5 mr-2" />
              Quick Access
            </h3>
            <div className="space-y-3">
              <button 
                onClick={handleCustomerLogin} 
                className="block text-gray-300 hover:text-white transition-colors text-left hover:translate-x-1 transition-transform"
              >
                Customer Portal
              </button>
              <button 
                onClick={handleAdminLogin} 
                className="block text-gray-300 hover:text-white transition-colors text-left hover:translate-x-1 transition-transform"
              >
                Admin System
              </button>
              <button 
                onClick={() => navigate("/")} 
                className="block text-gray-300 hover:text-white transition-colors text-left hover:translate-x-1 transition-transform"
              >
                Main Dashboard
              </button>
              <button 
                onClick={() => navigate("/collector/help")} 
                className="block text-gray-300 hover:text-white transition-colors text-left hover:translate-x-1 transition-transform"
              >
                Help & Support
              </button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Support</h3>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>collectors@pigmyxpress.com</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+91 98765 43210</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Bangalore, India</span>
              </div>
            </div>
            
            {/* Support Hours */}
            <div className="mt-4 p-3 bg-white/10 rounded-lg">
              <h4 className="text-sm font-semibold text-white mb-1">Support Hours</h4>
              <p className="text-xs text-gray-300">Mon-Sat: 9:00 AM - 6:00 PM</p>
              <p className="text-xs text-gray-300">Sunday: Emergency Only</p>
            </div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className="border-t border-gray-700 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-4 md:mb-0">
              <p className="text-gray-400 text-sm">
                &copy; 2024 PigmyXpress Collector System. Secure & Reliable.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm">System Status:</span>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-green-400 text-sm">Operational</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterCollector;