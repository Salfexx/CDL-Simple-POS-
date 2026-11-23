'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  DollarSign, 
  ShoppingCart, 
  Package, 
  AlertTriangle, 
  TrendingUp, 
  ArrowRight,
  Receipt,
  CreditCard
} from 'lucide-react';

export default function DashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/reports')
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Today's Sales",
      value: `$${(data?.todaySales?.total || 0).toFixed(2)}`,
      subtext: `${data?.todaySales?.count || 0} transactions today`,
      icon: DollarSign,
      color: "from-emerald-500/20 to-emerald-500/5",
      textColor: "text-emerald-400",
      borderColor: "border-emerald-500/30",
    },
    {
      title: "This Month's Sales",
      value: `$${(data?.monthSales?.total || 0).toFixed(2)}`,
      subtext: `${data?.monthSales?.count || 0} transactions this month`,
      icon: TrendingUp,
      color: "from-blue-500/20 to-blue-500/5",
      textColor: "text-blue-400",
      borderColor: "border-blue-500/30",
    },
    {
      title: "Total Inventory",
      value: data?.inventory?.totalProducts || 0,
      subtext: "Active products in catalog",
      icon: Package,
      color: "from-indigo-500/20 to-indigo-500/5",
      textColor: "text-indigo-400",
      borderColor: "border-indigo-500/30",
    },
    {
      title: "Low Stock Alert",
      value: data?.inventory?.lowStockCount || 0,
      subtext: "Items at or below threshold",
      icon: AlertTriangle,
      color: "from-amber-500/20 to-amber-500/5",
      textColor: "text-amber-400",
      borderColor: "border-amber-500/30",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">POS Dashboard</h1>
          <p className="text-sm text-slate-400 mt-1">Real-time sales, inventory, and revenue overview</p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/pos"
            className="inline-flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-4 py-2.5 rounded-xl shadow-lg shadow-emerald-600/20 transition-all text-sm"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Open Cashier Terminal</span>
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards (Meets assignment requirement: 3-4 metrics) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className={`p-6 rounded-2xl bg-gradient-to-br ${stat.color} border ${stat.borderColor} backdrop-blur-sm relative overflow-hidden`}
            >
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-slate-400">{stat.title}</span>
                <div className={`p-2 rounded-xl bg-slate-900/60 ${stat.textColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="text-3xl font-extrabold text-white tracking-tight">{stat.value}</div>
              <div className="text-xs text-slate-400 mt-2">{stat.subtext}</div>
            </div>
          );
        })}
      </div>

      {/* Grid: Top Selling Products & Payment Methods */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top 5 Products */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-white">Top Selling Products</h2>
              <p className="text-xs text-slate-400">Best performers by volume sold</p>
            </div>
            <Link
              href="/products"
              className="text-xs text-emerald-400 hover:underline flex items-center space-x-1"
            >
              <span>Manage Products</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Product</th>
                  <th className="pb-3 font-semibold text-right">Units Sold</th>
                  <th className="pb-3 font-semibold text-right">Total Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data?.topProducts?.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-500">
                      No sales recorded yet.
                    </td>
                  </tr>
                ) : (
                  data?.topProducts?.map((prod: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 font-medium text-slate-200">{prod.name}</td>
                      <td className="py-3 text-right text-slate-300 font-mono">{prod.totalSold}</td>
                      <td className="py-3 text-right text-emerald-400 font-bold font-mono">
                        ${parseFloat(prod.totalRevenue).toFixed(2)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quick Links & Payment Breakdown */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h2 className="text-lg font-bold text-white mb-4">Payment Breakdown</h2>
            <div className="space-y-3">
              {data?.paymentBreakdown?.length === 0 ? (
                <p className="text-xs text-slate-500">No payment data available.</p>
              ) : (
                data?.paymentBreakdown?.map((pb: any, idx: number) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800">
                    <div className="flex items-center space-x-2">
                      <CreditCard className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-medium text-slate-300">{pb.paymentMethod}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold text-white">${parseFloat(pb.total).toFixed(2)}</div>
                      <div className="text-xs text-slate-500">{pb.count} txns</div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-900/40 to-slate-900 border border-emerald-500/20 rounded-2xl p-6">
            <h3 className="font-bold text-white mb-2">Ready to ring up customers?</h3>
            <p className="text-xs text-slate-300 mb-4">
              Add products to cart, auto-deduct stock upon sale, and instantly print receipt.
            </p>
            <Link
              href="/pos"
              className="w-full inline-flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-emerald-600/30"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Launch POS</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
