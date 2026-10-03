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

// Bhai, yahan maine aapka live Render backend address permanently set kar diya hai
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
  }, [search, showLowStock, page, selectedDate, salesPage, activeTab]);

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
                    showLowStock ? "text-red-500 animate-pulse" : "text-amber-500"
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
                    setFormData({ ...formData, name: event.target.value })
                  }
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Price"
                    value={formData.price}
                    onChange={(event) =>
                      setFormData({ ...formData, price: event.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                  <input
                    type="number"
                    placeholder="Quantity"
                    value={formData.quantity}
                    onChange={(event) =>
                      setFormData({ ...formData, quantity: event.target.value })
                    }
                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-4 rounded-xl text-sm transition-all shadow-sm"
                >
                  Add Product
                </button>
              </form>
            </section>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
