import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import FilterPanel from "./FilterPanel";
import { type Transaction } from "../../transactions";
import { MoveDownLeft, MoveUpRight } from "lucide-react";
import { RiEqualizerFill } from "react-icons/ri";

interface Props {
  transactions: Transaction[];
}

const TransactionsPreview = ({ transactions }: Props) => {
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

    // 2. Filter panel conditions
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
    })

    // 3. Sort newest → oldest
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    // 4. Limit to first 3 for preview
    .slice(0, 3);

  return (
    <div className="mt-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-bold text-black text-2xl">Transactions</h2>
        <button
          aria-label="see-all"
          className="text-sm text-green-500"
          onClick={() => navigate("/transactions")}
        >
          See all
        </button>
      </div>

      {/*Tabs and Filter */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab("recent")}
              className={`text-sm font-medium ${
                activeTab === "recent"
                  ? "text-pri bg-pri/20 py-1 px-3 rounded-3xl"
                  : "text-black/70"
              } pb-1`}
            >
              Recent
            </button>
            <button
              onClick={() => setActiveTab("favorites")}
              className={`text-sm font-medium ${
                activeTab === "favorites"
                  ? "text-green-600 border-b-2 border-green-600"
                  : "text-black/70"
              } pb-1`}
            >
              Favorites
            </button>
          </div>
        </div>
        <button
          onClick={() => setShowFilter((prev) => !prev)}
          aria-label="filter"
          className="p-2 border-3 border-white/20 rounded-full "
        >
          <RiEqualizerFill className="w-5 h-5 text-pri" />
        </button>
      </div>

      {/* Inline Filter Panel */}
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

      {/* Transaction List (Preview only shows first 3) */}
      <div className="space-y-3">
        {filteredTx.slice(0, 3).map((t) => (
          <div
            key={t.id}
            className="flex items-center justify-between py-3  rounded-lg"
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
                <div className="font-semibold text-black/80">{t.title}</div>
                <div className="text-sm text-[#000000]/48">{t.subtitle}</div>
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
              <div className="text-xs text-[#000000]/48 mt-1">{t.time}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionsPreview;
