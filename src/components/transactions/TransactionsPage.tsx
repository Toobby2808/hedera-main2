import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { useState } from "react";
import FilterPanel from "./FilterPanel";
import { transactions } from "../../transactions";
import { ChevronLeft, MoveUpRight, MoveDownLeft } from "lucide-react";
import { RiEqualizerFill } from "react-icons/ri";

const TransactionsPage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<"recent" | "favorites">("recent");
  const [showFilter, setShowFilter] = useState(false);

  const [filters, setFilters] = useState({
    type: "all",
    date: "all",
    direction: "all",
  });

  function handleFilterChange(key: string, value: string) {
    setFilters((prev) => ({ ...prev, [key]: value }));
  }

  const filteredTx = transactions
    //  1. Tab filter — show favorites if selected
    .filter((t) => {
      if (activeTab === "favorites") return t.favorite === true;
      return true;
    })

    // 🧩 2. Filter panel conditions
    .filter((t) => {
      // type filter
      if (filters.type !== "all" && t.type !== filters.type) return false;

      // direction filter
      if (filters.direction === "income" && !t.positive) return false;
      if (filters.direction === "expense" && t.positive) return false;

      // date filter
      if (filters.date === "today") {
        const today = new Date().toISOString().split("T")[0];
        return t.date === today;
      }

      if (filters.date === "week") {
        const now = new Date();
        const weekAgo = new Date();
        weekAgo.setDate(now.getDate() - 7);
        const txDate = new Date(t.date);
        return txDate >= weekAgo && txDate <= now;
      }

      if (filters.date === "month") {
        const now = new Date();
        const monthAgo = new Date();
        monthAgo.setMonth(now.getMonth() - 1);
        const txDate = new Date(t.date);
        return txDate >= monthAgo && txDate <= now;
      }

      return true;
    });

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", stiffness: 70, damping: 15 }}
      className="fixed inset-0 bg-gray-50 p-4 overflow-y-auto z-50"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="p-1 bg-white rounded-full shadow"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-semibold">Transactions</h2>
        <button
          onClick={() => setShowFilter((p) => !p)}
          className="p-2 bg-white rounded-full shadow"
        >
          <RiEqualizerFill className="w-5 h-5 text-pri" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={() => setActiveTab("recent")}
          className={`text-sm font-medium ${
            activeTab === "recent"
              ? "text-green-600 border-b-2 border-green-600"
              : "text-gray-500"
          } pb-1`}
        >
          Recent
        </button>
        <button
          onClick={() => setActiveTab("favorites")}
          className={`text-sm font-medium ${
            activeTab === "favorites"
              ? "text-green-600 border-b-2 border-green-600"
              : "text-gray-500"
          } pb-1`}
        >
          Favorites
        </button>
      </div>

      {/* Filter */}
      {showFilter && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="mb-3"
        >
          <FilterPanel filters={filters} onChange={handleFilterChange} />
        </motion.div>
      )}

      {/* Full Transactions List */}
      <div className="space-y-3">
        {filteredTx.map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between bg-white p-3 rounded-lg shadow"
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  t.positive ? "bg-pri/14" : "bg-red-100"
                }`}
              >
                {t.positive ? (
                  <MoveDownLeft className="text-pri" />
                ) : (
                  <MoveUpRight className="text-[#f60202]" />
                )}
              </div>
              <div>
                <div className="font-semibold">{t.title}</div>
                <div className="text-sm text-gray-500">{t.subtitle}</div>
              </div>
            </div>
            <div className="text-right">
              <div
                className={`${
                  t.positive ? "text-green-600" : "text-red-500"
                } font-medium`}
              >
                {t.amount > 0 ? +`${t.amount}` : t.amount}
              </div>
              <div className="text-xs text-gray-400 mt-1">{t.time}</div>
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
};

export default TransactionsPage;
