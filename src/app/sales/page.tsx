'use client';

import { useState, useEffect } from 'react';
import { 
  Receipt, 
  Search, 
  Printer, 
  Calendar, 
  CreditCard, 
  CheckCircle, 
  Eye, 
  X 
} from 'lucide-react';

interface SaleItem {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: string;
  subtotal: string;
}

interface Sale {
  id: string;
  invoiceNumber: string;
  cashierName: string;
  totalAmount: string;
  receivedAmount: string;
  changeAmount: string;
  paymentMethod: string;
  status: string;
  createdAt: string;
  items: SaleItem[];
}

export default function SalesHistoryPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const fetchSales = async () => {
    try {
      const url = new URL('/api/sales', window.location.origin);
      if (search) url.searchParams.set('search', search);

      const res = await fetch(url.toString());
      const data = await res.json();
      setSales(data.sales || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
    setCurrentPage(1);
  }, [search]);

  const totalPages = Math.ceil(sales.length / itemsPerPage) || 1;
  const paginatedSales = sales.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Sales & Invoices</h1>
          <p className="text-sm text-slate-400 mt-1">
            Complete transaction records, receipts, and order archives
          </p>
        </div>
      </div>

      {/* Search Input */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by invoice number (e.g. INV-2026-0001)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
          />
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Invoice #</th>
                <th className="px-6 py-4 font-semibold">Date & Time</th>
                <th className="px-6 py-4 font-semibold">Cashier</th>
                <th className="px-6 py-4 font-semibold">Payment</th>
                <th className="px-6 py-4 font-semibold text-right">Items</th>
                <th className="px-6 py-4 font-semibold text-right">Total Amount</th>
                <th className="px-6 py-4 font-semibold text-center">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-400">
                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    Loading transactions...
                  </td>
                </tr>
              ) : paginatedSales.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                    <Receipt className="w-10 h-10 mx-auto mb-2 opacity-30" />
                    No sales records found.
                  </td>
                </tr>
              ) : (
                paginatedSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-6 py-4 font-mono font-medium text-emerald-400">
                      {sale.invoiceNumber}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(sale.createdAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-medium">
                      {sale.cashierName}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs bg-slate-800 text-slate-300 px-2.5 py-1 rounded-md font-medium">
                        {sale.paymentMethod}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-slate-300">
                      {sale.items?.reduce((acc, it) => acc + it.quantity, 0) || 0}
                    </td>
                    <td className="px-6 py-4 text-right font-bold text-white font-mono text-base">
                      ${parseFloat(sale.totalAmount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => setViewingSale(sale)}
                        className="inline-flex items-center space-x-1 p-1.5 px-3 rounded-lg bg-slate-800 hover:bg-emerald-600 hover:text-white text-slate-300 text-xs font-medium transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View / Print</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div>
            Showing <span className="text-white font-medium">{paginatedSales.length}</span> of{' '}
            <span className="text-white font-medium">{sales.length}</span> transactions
          </div>
          <div className="flex gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-30 transition-colors"
            >
              Previous
            </button>
            <span className="px-3 py-1.5 bg-slate-800 rounded-lg text-white font-mono font-medium">
              Page {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-800 hover:bg-slate-800 disabled:opacity-30 transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Receipt Modal (Printable) */}
      {viewingSale && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl relative text-center">
            <button
              onClick={() => setViewingSale(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-bold text-white mb-1">Receipt Details</h3>
            <p className="text-xs text-slate-400 mb-4 font-mono">{viewingSale.invoiceNumber}</p>

            <div id="print-modal-receipt" className="p-4 bg-white text-slate-900 rounded-xl text-left font-mono text-xs shadow-inner">
              <div className="text-center pb-2 border-b border-dashed border-slate-300">
                <p className="font-bold text-sm">CDL MINI POS</p>
                <p className="text-[10px] text-slate-500">Phnom Penh, Cambodia</p>
                <p className="text-[10px] text-slate-500 mt-1">Cashier: {viewingSale.cashierName}</p>
                <p className="text-[10px] text-slate-500">{new Date(viewingSale.createdAt).toLocaleString()}</p>
              </div>

              <div className="py-2 border-b border-dashed border-slate-300 space-y-1">
                {viewingSale.items?.map((it, idx) => (
                  <div key={idx} className="flex justify-between">
                    <span className="truncate max-w-[150px]">{it.productName} x{it.quantity}</span>
                    <span>${parseFloat(it.subtotal).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 space-y-1">
                <div className="flex justify-between font-bold text-sm">
                  <span>TOTAL:</span>
                  <span>${parseFloat(viewingSale.totalAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>Paid ({viewingSale.paymentMethod}):</span>
                  <span>${parseFloat(viewingSale.receivedAmount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>Change:</span>
                  <span>${parseFloat(viewingSale.changeAmount).toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center pt-3 text-[10px] text-slate-500 border-t border-dashed border-slate-300 mt-2">
                Thank you! Please visit us again.
              </div>
            </div>

            <div className="mt-4 flex gap-2">
              <button
                onClick={() => window.print()}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold flex items-center justify-center space-x-1.5 shadow-lg shadow-emerald-600/30 transition-colors cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>Print PDF / Thermal Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
