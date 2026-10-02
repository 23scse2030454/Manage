import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  Plus,
  Minus,
  AlertTriangle,
  Layers,
  Calendar,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
} from "lucide-react";

const API_URL = "https://manage-3vah.onrender.com/api";

function App() {
  const [activeTab, setActiveTab] = useState("inventory");

  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState("");
  const [showLowStock, setShowLowStock] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);

  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );

  const [salesReport, setSalesReport] = useState([]);
  const [salesPage, setSalesPage] = useState(1);
  const [salesTotalPages, setSalesTotalPages] = useState(1);
  const [salesTotalItems, setSalesTotalItems] = useState(0);
  const [dayTotalAmount, setDayTotalAmount] = useState(0);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    quantity: "",
  });

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        `${API_URL}/products?search=${encodeURIComponent(
          search
        )}&showLowStock=${showLowStock}&page=${page}`
      );

      if (response.data.success) {
        const productList = response.data.data || [];

        setProducts(productList);
        setTotalPages(response.data.totalPages || 1);
        setTotalItems(response.data.totalItems || 0);

        const lowStockItems = productList.filter(
          (item) => Number(item.quantity) <= 5
        );

        if (lowStockItems.length > 0 && !showLowStock) {
          const names = lowStockItems.map((item) => item.name).join(", ");

          // alert(
          //   `Low Stock Alert!\n\nThese products have 5 or fewer items left:\n${names}\n\nPlease add new stock.`
          // );
        }
      }
    } catch (error) {
      console.error("Error loading products:", error);
    }
  };

  const fetchSalesReport = async () => {
    if (!selectedDate) return;

    try {
      const response = await axios.get(
        `${API_URL}/sales/report?date=${selectedDate}&page=${salesPage}`
      );

      if (response.data.success) {
        setSalesReport(response.data.data || []);
        setSalesTotalPages(response.data.totalPages || 1);
        setSalesTotalItems(response.data.totalItems || 0);

        // Full selected day's total from backend
        setDayTotalAmount(response.data.fullDayTotal ?? 0);
      }
    } catch (error) {
      console.error("Error loading sales report:", error);
    }
  };

  useEffect(() => {
    if (activeTab === "inventory") {
      fetchProducts();
    }

    if (activeTab === "dailylog") {
      fetchSalesReport();
    }
  }, [
    search,
    showLowStock,
    page,
    selectedDate,
    salesPage,
    activeTab,
  ]);

  useEffect(() => {
    setSalesPage(1);
    setDayTotalAmount(0);
  }, [selectedDate]);

  const handleAddProduct = async (event) => {
    event.preventDefault();

    if (!formData.name || !formData.quantity) {
      alert("Please enter product name and quantity.");
      return;
    }

    try {
      await axios.post(`${API_URL}/products/add-single`, formData);

      setFormData({
        name: "",
        price: "",
        quantity: "",
      });

      setPage(1);
      await fetchProducts();

      alert("Stock added successfully.");
    } catch (error) {
      console.error(error);
      alert("Error adding stock.");
    }
  };

  const handleSell = async (id) => {
    try {
      await axios.post(`${API_URL}/products/sell`, { id });

      await fetchProducts();
    } catch (error) {
      console.error("Error reducing stock:", error);
      alert("Unable to update stock.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900 pb-10">
      <header className="bg-blue-600 text-white shadow-md p-4 sticky top-0 z-50 text-center">
        <h1 className="text-xl sm:text-2xl font-bold tracking-wide">
          John Naqvi
        </h1>

        <p className="text-xs text-blue-100 mt-1">
          Smart Stock Management System
        </p>

        <div className="flex justify-center gap-2 sm:gap-4 mt-3 flex-wrap">
          <button
            onClick={() => setActiveTab("inventory")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "inventory"
                ? "bg-white text-blue-600 shadow"
                : "bg-blue-700 text-blue-100 hover:bg-blue-800"
            }`}
          >
            <ClipboardList className="inline w-4 h-4 mr-1" />
            Inventory
          </button>

          <button
            onClick={() => setActiveTab("dailylog")}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
              activeTab === "dailylog"
                ? "bg-white text-blue-600 shadow"
                : "bg-blue-700 text-blue-100 hover:bg-blue-800"
            }`}
          >
            <Calendar className="inline w-4 h-4 mr-1" />
            Daily Sales
          </button>
        </div>
      </header>

      <main className="w-full max-w-7xl mx-auto px-3 sm:px-5 lg:px-8 mt-5">
        {activeTab === "inventory" && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-5 max-w-2xl mx-auto">
              <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500 font-medium">
                    Total Products
                  </p>

                  <h3 className="text-lg sm:text-xl font-bold text-gray-800 mt-1">
                    {totalItems}
                  </h3>
                </div>

                <Layers className="text-blue-500 w-6 h-6 sm:w-7 sm:h-7" />
              </div>

              <button
                onClick={() => {
                  setShowLowStock(!showLowStock);
                  setPage(1);
                }}
                className={`p-3 sm:p-4 rounded-xl shadow-sm text-left border flex items-center justify-between transition-all ${
                  showLowStock
                    ? "bg-red-50 border-red-300 text-red-700 ring-2 ring-red-400"
                    : "bg-white border-gray-200 text-gray-800 hover:bg-gray-50"
                }`}
              >
                <div>
                  <p className="text-xs font-medium text-gray-500">
                    Low Stock
                  </p>

                  <h3 className="text-xs sm:text-sm font-bold mt-1">
                    {showLowStock ? "Alert Active" : "Check Stock"}
                  </h3>
                </div>

                <AlertTriangle
                  className={`w-6 h-6 sm:w-7 sm:h-7 ${
                    showLowStock
                      ? "text-red-500 animate-pulse"
                      : "text-amber-500"
                  }`}
                />
              </button>
            </div>

            <section className="bg-white p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-200 mb-5 max-w-3xl mx-auto">
              <h2 className="text-sm sm:text-md font-bold text-gray-800 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600" />
                Add New Stock
              </h2>

              <form onSubmit={handleAddProduct} className="space-y-3">
                <input
                  type="text"
                  placeholder="Product name"
                  value={formData.name}
                  onChange={(event) =>
                    setFormData({
                      ...formData,
                      name: event.target.value,
                    })
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />

                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Price"
                    value={formData.price}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        price: event.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />

                  <input
                    type="number"
                    placeholder="Quantity"
                    value={formData.quantity}
                    onChange={(event) =>
                      setFormData({
                        ...formData,
                        quantity: event.target.value,
                      })
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-blue-600 text-white font-bold py-2.5 rounded-xl shadow-md hover:bg-blue-700 transition-all text-sm"
                >
                  Save Stock
                </button>
              </form>
            </section>

            <div className="relative mb-5 max-w-4xl mx-auto">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </span>

              <input
                type="text"
                placeholder="Search products..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                className="w-full pl-10 pr-4 py-3 bg-white border border-gray-300 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>

            {products.length === 0 ? (
              <div className="bg-white rounded-xl p-8 text-center shadow-sm">
                <p className="text-gray-500">No products found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.map((item) => {
                  const isLowStock = Number(item.quantity) <= 5;

                  return (
                    <div
                      key={item._id}
                      className={`p-4 rounded-xl shadow-sm border transition-all ${
                        isLowStock
                          ? "bg-red-50 border-red-300 ring-1 ring-red-300"
                          : "bg-white border-gray-200"
                      }`}
                    >
                      <div className="flex justify-between items-start gap-3">
                        <div className="min-w-0">
                          <h3 className="font-bold text-gray-800 break-words">
                            {item.name}
                          </h3>

                          <p className="text-sm text-gray-600 mt-1">
                            Price: ₹{item.price}
                          </p>
                        </div>

                        <span
                          className={`text-xs px-2 py-1 rounded-full font-bold whitespace-nowrap ${
                            isLowStock
                              ? "bg-red-200 text-red-800"
                              : "bg-green-100 text-green-800"
                          }`}
                        >
                          {item.quantity} pcs
                        </span>
                      </div>

                      {isLowStock && (
                        <div className="mt-3 text-xs font-bold text-red-700">
                          <AlertTriangle className="inline w-4 h-4 mr-1" />
                          Low stock
                        </div>
                      )}

                      <button
                        onClick={() => handleSell(item._id)}
                        disabled={Number(item.quantity) <= 0}
                        className="w-full mt-4 bg-amber-500 hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed active:scale-95 text-white p-2.5 rounded-xl shadow transition-all flex items-center justify-center gap-2 font-bold text-sm"
                      >
                        <Minus className="w-4 h-4" />
                        Sell 1
                      </button>
                    </div>
                  );
                })}
              </div>
            )}

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-3 mt-6">
                <button
                  onClick={() =>
                    setPage((current) => Math.max(current - 1, 1))
                  }
                  disabled={page === 1}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium hover:bg-gray-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Prev
                </button>

                <span className="text-sm font-medium">
                  Page {page} of {totalPages}
                </span>

                <button
                  onClick={() =>
                    setPage((current) =>
                      Math.min(current + 1, totalPages)
                    )
                  }
                  disabled={page === totalPages}
                  className="flex items-center gap-1 px-4 py-2 rounded-lg bg-white border border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed text-xs font-medium hover:bg-gray-50"
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}

        {activeTab === "dailylog" && (
          <section className="max-w-5xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-800">
                    Daily Sales Log
                  </h2>

                  <p className="text-sm text-gray-500 mt-1">
                    Check sales for the selected date
                  </p>
                </div>

                <input
                  type="date"
                  value={selectedDate}
                  onChange={(event) => {
                    setSelectedDate(event.target.value);
                    setSalesPage(1);
                  }}
                  className="border border-gray-300 p-2 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 mb-6 text-center">
                <DollarSign className="w-7 h-7 text-blue-600 mx-auto mb-2" />

                <p className="text-sm text-gray-600">
                  Total sales for selected date
                </p>

                <h3 className="text-2xl sm:text-3xl font-bold text-blue-700 mt-1">
                  ₹{" "}
                  {Number(dayTotalAmount || 0).toLocaleString("en-IN", {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                  })}
                </h3>

                <p className="text-xs text-gray-500 mt-2">
                  Complete sales total for this date
                </p>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-800">
                    Sold Products
                  </h3>

                  <span className="text-xs text-gray-500">
                    {salesTotalItems} items
                  </span>
                </div>

                {salesReport.length === 0 ? (
                  <div className="border border-gray-200 rounded-xl p-8 text-center">
                    <p className="text-gray-500 text-sm">
                      No products were sold on this date.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[600px] text-sm">
                      <thead>
                        <tr className="bg-gray-50 border-b">
                          <th className="text-left p-3 font-semibold">
                            Product
                          </th>

                          <th className="text-left p-3 font-semibold">
                            Quantity
                          </th>

                          <th className="text-left p-3 font-semibold">
                            Price
                          </th>

                          <th className="text-left p-3 font-semibold">
                            Total
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {salesReport.map((sale, index) => (
                          <tr
                            key={sale._id || index}
                            className="border-b last:border-b-0"
                          >
                            <td className="p-3 font-medium">
                              {sale.productName}
                            </td>

                            <td className="p-3">
                              {sale.quantitySold} pcs
                            </td>

                            <td className="p-3">
                              ₹{sale.price}
                            </td>

                            <td className="p-3 font-bold">
                              ₹{sale.totalAmount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {salesTotalPages > 1 && (
                <div className="flex items-center justify-center gap-3 mt-6">
                  <button
                    onClick={() =>
                      setSalesPage((current) =>
                        Math.max(current - 1, 1)
                      )
                    }
                    disabled={salesPage === 1}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs hover:bg-gray-100"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Prev
                  </button>

                  <span className="text-sm font-medium">
                    Page {salesPage} of {salesTotalPages}
                  </span>

                  <button
                    onClick={() =>
                      setSalesPage((current) =>
                        Math.min(
                          current + 1,
                          salesTotalPages
                        )
                      )
                    }
                    disabled={salesPage === salesTotalPages}
                    className="flex items-center gap-1 px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed text-xs hover:bg-gray-100"
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
