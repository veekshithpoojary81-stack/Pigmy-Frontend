import { PiggyBank } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Footer = () => {
  const navigate = useNavigate();

  const handleCustomerLogin = () => {
    navigate("/auth");
  };

  const handleAdminLogin = () => {
    navigate("/admin/login");
  };

  return (
    <footer className="bg-gradient-to-r from-gray-900 to-blue-900 text-white py-12 mx-[-1.3rem] mt-16 w-screen mr-2">
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
              Your trusted partner in building financial security through smart savings 
              and disciplined investment habits.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <div className="space-y-3">
              <button onClick={() => navigate("/")} className="block text-gray-300 hover:text-white transition-colors text-left">Home Dashboard</button>
              <button onClick={handleCustomerLogin} className="block text-gray-300 hover:text-white transition-colors text-left">Customer Portal</button>
              <button onClick={handleAdminLogin} className="block text-gray-300 hover:text-white transition-colors text-left">Admin System</button>
              <button onClick={() => navigate("/feedback")} className="block text-gray-300 hover:text-white transition-colors text-left">Support & Feedback</button>
            </div>
          </div>
          {/* <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <div className="space-y-3 text-gray-300">
              <div>Daily Savings</div>
              <div>Fixed Deposits</div>
              <div>Loan Services</div>
              <div>Investment Plans</div>
            </div>
          </div> */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Info</h3>
            <div className="space-y-3 text-gray-300">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                support@pigmyxpress.com
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                +91 98765 43210
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Bangalore, India
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2024 PigmyXpress. Building Financial Freedom, One Rupee at a Time.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;