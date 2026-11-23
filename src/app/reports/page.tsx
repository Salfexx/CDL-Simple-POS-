'use client';

import { useState, useEffect } from 'react';
import { 
  BarChart3, 
  DollarSign, 
  TrendingUp, 
  Package, 
  Download, 
  Calendar,
  CreditCard
} from 'lucide-react';

export default function ReportsPage() {
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

  const exportCSV = () => {
    if (!data?.topProducts) return;

    const headers = ['Product Name', 'Total Units Sold', 'Total Revenue ($)'];
    const rows = data.topProducts.map((p: any) => [
      `"${p.name}"`,
      p.totalSold,
      parseFloat(p.totalRevenue).toFixed(2),
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e: any[]) => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CDL_POS_SalesReport_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Reports & Analytics</h1>
          <p className="text-sm text-slate-400 mt-1">
            Sales performance, payment trends, and product velocity
          </p>
        </div>
        <button
          onClick={exportCSV}
          className="inline-flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-white font-medium px-4 py-2.5 rounded-xl border border-slate-700 shadow transition-all text-sm cursor-pointer"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Export CSV Report</span>
        </button>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400 font-medium">Today&apos;s Revenue</span>
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            ${(data?.todaySales?.total || 0).toFixed(2)}
          </div>
          <p className="text-xs text-slate-500 mt-1">{data?.todaySales?.count || 0} orders processed</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400 font-medium">Monthly Revenue</span>
            <TrendingUp className="w-5 h-5 text-blue-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            ${(data?.monthSales?.total || 0).toFixed(2)}
          </div>
          <p className="text-xs text-slate-500 mt-1">{data?.monthSales?.count || 0} orders processed</p>
        </div>

        <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-slate-400 font-medium">Low Stock Items</span>
            <Package className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {data?.inventory?.lowStockCount || 0}
          </div>
          <p className="text-xs text-slate-500 mt-1">Requires reorder attention</p>
        </div>
      </div>

      {/* Grid: Sales Trend & Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top 5 Products Table */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Top Performing Products</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Product Name</th>
                  <th className="pb-3 font-semibold text-right">Units Sold</th>
                  <th className="pb-3 font-semibold text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data?.topProducts?.map((p: any, idx: number) => (
                  <tr key={idx} className="hover:bg-slate-800/30">
                    <td className="py-3 font-medium text-slate-200">{p.name}</td>
                    <td className="py-3 text-right font-mono text-slate-300">{p.totalSold}</td>
                    <td className="py-3 text-right font-mono font-bold text-emerald-400">
                      ${parseFloat(p.totalRevenue).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Payment Methods Distribution */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Revenue by Payment Channel</h2>
          <div className="space-y-4">
            {data?.paymentBreakdown?.map((pb: any, idx: number) => {
              const totalMonth = data?.monthSales?.total || 1;
              const percent = Math.min(
                100,
                Math.round((parseFloat(pb.total) / (totalMonth || 1)) * 100)
              );

              return (
                <div key={idx} className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-slate-300">{pb.paymentMethod}</span>
                    <span className="font-mono text-white font-bold">
                      ${parseFloat(pb.total).toFixed(2)} ({percent}%)
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
