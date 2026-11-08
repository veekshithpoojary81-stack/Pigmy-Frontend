import React, { useState } from "react";

const PaymentPage = () => {
  const [paymentMode, setPaymentMode] = useState("offline");
  const [formData, setFormData] = useState({
    amount: "1000",
    accountNumber: "XXXX-XXXX-XXXX",
    cardNumber: "1234 5678 9012 3456",
    expiry: "MM/YY",
    cw: "123",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center items-center p-5">
      <div className="bg-white rounded-lg shadow-md p-6 w-full max-w-md">
        {/* Header */}
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Make Payment</h1>
        <p className="text-gray-600 text-sm mb-6">
          Choose your payment method and complete the transaction
        </p>

        {/* Payment Mode Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Payment Mode
          </h2>
          <div className="space-y-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="paymentMode"
                value="online"
                checked={paymentMode === "online"}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="hidden"
              />
              <div
                className={`w-5 h-5 border-2 rounded-full mr-3 flex items-center justify-center ${
                  paymentMode === "online"
                    ? "border-blue-500 bg-blue-500"
                    : "border-gray-300"
                }`}
              >
                {paymentMode === "online" && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
              <span className="text-gray-700">Online Payment</span>
            </label>

            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="paymentMode"
                value="offline"
                checked={paymentMode === "offline"}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="hidden"
              />
              <div
                className={`w-5 h-5 border-2 rounded-full mr-3 flex items-center justify-center ${
                  paymentMode === "offline"
                    ? "border-blue-500 bg-blue-500"
                    : "border-gray-300"
                }`}
              >
                {paymentMode === "offline" && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
              <span className="text-gray-700">Offline Payment</span>
            </label>
          </div>
        </div>

        <div className="border-t border-gray-200 my-6"></div>

        {/* Amount Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Amount (€)
          </h2>
          <input
            type="text"
            name="amount"
            value={formData.amount}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="border-t border-gray-200 my-6"></div>

        {/* Account Number Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Account Number
          </h2>
          <input
            type="text"
            name="accountNumber"
            value={formData.accountNumber}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="border-t border-gray-200 my-6"></div>

        {/* Card Number Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">
            Card Number
          </h2>
          <input
            type="text"
            name="cardNumber"
            value={formData.cardNumber}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="border-t border-gray-200 my-6"></div>

        {/* Expiry Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Expiry</h2>
          <input
            type="text"
            name="expiry"
            value={formData.expiry}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="border-t border-gray-200 my-6"></div>

        {/* CW Section */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-2">CW</h2>
          <input
            type="text"
            name="cw"
            value={formData.cw}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        <div className="border-t border-gray-200 my-6"></div>

        {/* Complete Payment Button */}
        <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-200">
          Complete Payment
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;
