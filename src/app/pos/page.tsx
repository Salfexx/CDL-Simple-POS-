'use client';

import { useState, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  Printer, 
  CheckCircle2, 
  DollarSign, 
  QrCode, 
  CreditCard,
  Package
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
  barcode: string;
  price: string;
  stock: number;
  minStock: number;
  categoryName: string;
  categoryId: string;
}

interface CartItem {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  stock: number;
}

export default function POSTerminalPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [search, setSearch] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Checkout modal state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'CASH' | 'KHQR' | 'CARD'>('CASH');
  const [receivedAmount, setReceivedAmount] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [completedSale, setCompletedSale] = useState<any>(null);

  // Load products
  const fetchProducts = async () => {
    try {
      const url = new URL('/api/products', window.location.origin);
      if (search) url.searchParams.set('search', search);
      if (selectedCategory) url.searchParams.set('categoryId', selectedCategory);

      const res = await fetch(url.toString());
      const data = await res.json();
      setProducts(data.products || []);
      setCategories(data.categories || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search, selectedCategory]);

  // Cart operations
  const addToCart = (product: Product) => {
    if (product.stock <= 0) return;

    setCart((prev) => {
      const existing = prev.find((item) => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return prev; // Cannot exceed stock
        return prev.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.name,
          unitPrice: parseFloat(product.price),
          quantity: 1,
          stock: product.stock,
        },
      ];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.productId === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.stock) return item;
            return { ...item, quantity: newQty };
          }
          return item;
        })
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalAmount = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

  // Handle Complete Checkout
  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setSubmitting(true);

    try {
      const res = await fetch('/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cart,
          paymentMethod,
          receivedAmount: receivedAmount ? parseFloat(receivedAmount) : totalAmount,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to complete transaction');

      setCompletedSale(data.sale);
      setCart([]);
      fetchProducts(); // Refresh products to show updated auto-deducted stocks!
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 min-h-[calc(100vh-8rem)]">
      {/* Left Column: Product Catalog */}
      <div className="flex-1 flex flex-col space-y-4">
        {/* Search & Category Filter Bar */}
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search product name or scan barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === ''
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              All Categories
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-12 text-center text-slate-500">
              <Package className="w-12 h-12 mx-auto mb-3 opacity-40" />
              <p className="font-medium text-slate-400">No products found</p>
              <p className="text-xs mt-1">Try searching for something else or add new products.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3.5">
              {products.map((product) => {
                const isOutOfStock = product.stock <= 0;
                const isLowStock = product.stock > 0 && product.stock <= product.minStock;

                return (
                  <button
                    key={product.id}
                    disabled={isOutOfStock}
                    onClick={() => addToCart(product)}
                    className={`flex flex-col justify-between p-4 rounded-2xl border text-left transition-all ${
                      isOutOfStock
                        ? 'bg-slate-900/40 border-slate-800/50 opacity-50 cursor-not-allowed'
                        : 'bg-slate-900 border-slate-800 hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-950/40 cursor-pointer active:scale-[0.98]'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-2">
                        <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-2 py-0.5 rounded-full truncate max-w-[100px]">
                          {product.categoryName}
                        </span>
                        {isOutOfStock ? (
                          <span className="text-[10px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 px-1.5 py-0.5 rounded">
                            Out of Stock
                          </span>
                        ) : isLowStock ? (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-1.5 py-0.5 rounded">
                            {product.stock} left
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400 font-mono">
                            Stock: {product.stock}
                          </span>
                        )}
                      </div>
                      <h3 className="font-medium text-sm text-white line-clamp-2 leading-snug">
                        {product.name}
                      </h3>
                      {product.barcode && (
                        <p className="text-[10px] text-slate-500 font-mono mt-0.5">
                          #{product.barcode}
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                      <span className="text-base font-extrabold text-emerald-400 font-mono">
                        ${parseFloat(product.price).toFixed(2)}
                      </span>
                      <span className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500 hover:text-white transition-colors">
                        <Plus className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Active Cart & Register */}
      <div className="w-full lg:w-96 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col h-[600px] lg:h-auto overflow-hidden shadow-2xl">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
          <div className="flex items-center space-x-2">
            <ShoppingCart className="w-5 h-5 text-emerald-400" />
            <h2 className="font-bold text-white">Current Order</h2>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs text-red-400 hover:text-red-300 transition-colors"
            >
              Clear Cart
            </button>
          )}
        </div>

        {/* Cart Item List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center text-slate-500">
              <ShoppingCart className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm font-medium">Cart is empty</p>
              <p className="text-xs mt-1">Tap products to start ringing up</p>
            </div>
          ) : (
            cart.map((item) => (
              <div
                key={item.productId}
                className="bg-slate-950 border border-slate-800/80 p-3 rounded-xl flex items-center justify-between gap-2"
              >
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-white truncate">{item.name}</h4>
                  <p className="text-xs text-emerald-400 font-mono mt-0.5">
                    ${item.unitPrice.toFixed(2)} × {item.quantity} ={' '}
                    <span className="font-bold">
                      ${(item.unitPrice * item.quantity).toFixed(2)}
                    </span>
                  </p>
                </div>

                <div className="flex items-center space-x-1 bg-slate-900 rounded-lg p-1 border border-slate-800">
                  <button
                    onClick={() => updateQuantity(item.productId, -1)}
                    className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-6 text-center text-xs font-bold text-white font-mono">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.productId, 1)}
                    disabled={item.quantity >= item.stock}
                    className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 disabled:opacity-30 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                <button
                  onClick={() => removeFromCart(item.productId)}
                  className="p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Cart Summary & Checkout Button */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3">
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-slate-400 text-xs">
              <span>Items Total:</span>
              <span className="font-mono">{cart.reduce((c, i) => c + i.quantity, 0)} units</span>
            </div>
            <div className="flex justify-between text-white font-bold text-lg pt-1 border-t border-slate-800/80">
              <span>Total:</span>
              <span className="text-emerald-400 font-mono">${totalAmount.toFixed(2)}</span>
            </div>
          </div>

          <button
            disabled={cart.length === 0}
            onClick={() => {
              setReceivedAmount(totalAmount.toFixed(2));
              setIsCheckoutOpen(true);
            }}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 text-sm cursor-pointer"
          >
            <span>Proceed to Payment</span>
            <span className="font-mono">(${totalAmount.toFixed(2)})</span>
          </button>
        </div>
      </div>

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-4">Complete Payment</h3>

            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-400 mb-2">
                Select Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'CASH', label: 'Cash', icon: DollarSign },
                  { id: 'KHQR', label: 'Bakong KHQR', icon: QrCode },
                  { id: 'CARD', label: 'Card', icon: CreditCard },
                ].map((pm) => {
                  const Icon = pm.icon;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => setPaymentMethod(pm.id as any)}
                      className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-medium transition-all ${
                        paymentMethod === pm.id
                          ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400'
                          : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <Icon className="w-5 h-5 mb-1" />
                      {pm.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {paymentMethod === 'KHQR' && (
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center mb-4">
                <div className="w-36 h-36 bg-white rounded-lg mx-auto flex items-center justify-center p-2 mb-2">
                  <div className="w-full h-full border-2 border-dashed border-slate-400 flex flex-col items-center justify-center text-slate-800">
                    <QrCode className="w-16 h-16 text-slate-900" />
                    <span className="text-[10px] font-bold mt-1">KHQR PAY</span>
                  </div>
                </div>
                <p className="text-xs text-slate-400">Scan with any Cambodian Banking App</p>
                <p className="text-sm font-bold text-emerald-400 mt-1 font-mono">${totalAmount.toFixed(2)}</p>
              </div>
            )}

            {paymentMethod === 'CASH' && (
              <div className="mb-4 space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Received Cash ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={receivedAmount}
                    onChange={(e) => setReceivedAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2 text-white font-mono text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                  />
                </div>

                <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 flex justify-between items-center text-sm">
                  <span className="text-slate-400">Change Due:</span>
                  <span className="font-bold text-emerald-400 font-mono text-base">
                    ${Math.max(0, (parseFloat(receivedAmount) || 0) - totalAmount).toFixed(2)}
                  </span>
                </div>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                type="button"
                onClick={() => setIsCheckoutOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-800 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting}
                onClick={handleCheckout}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center space-x-1 cursor-pointer"
              >
                {submitting ? 'Processing...' : 'Confirm Sale'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sale Success & Printable Receipt Modal (Meets Bonus/Core POS requirement) */}
      {completedSale && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-2xl text-center">
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-3">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <h3 className="text-lg font-bold text-white">Payment Successful!</h3>
            <p className="text-xs text-slate-400 mt-0.5">Invoice: {completedSale.invoiceNumber}</p>

            {/* Printable Receipt Preview */}
            <div id="receipt-area" className="my-4 p-4 bg-white text-slate-900 rounded-xl text-left font-mono text-xs shadow-inner">
              <div className="text-center pb-2 border-b border-dashed border-slate-300">
                <p className="font-bold text-sm">CDL MINI POS</p>
                <p className="text-[10px] text-slate-500">Phnom Penh, Cambodia</p>
                <p className="text-[10px] text-slate-500 mt-1">Inv: {completedSale.invoiceNumber}</p>
                <p className="text-[10px] text-slate-500">{new Date(completedSale.createdAt).toLocaleString()}</p>
              </div>

              <div className="py-2 border-b border-dashed border-slate-300 space-y-1">
                {completedSale.items.map((it: any, idx: number) => (
                  <div key={idx} className="flex justify-between">
                    <span className="truncate max-w-[150px]">{it.name} x{it.quantity}</span>
                    <span>${(it.unitPrice * it.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="pt-2 space-y-1">
                <div className="flex justify-between font-bold text-sm">
                  <span>TOTAL:</span>
                  <span>${completedSale.totalAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>Paid ({completedSale.paymentMethod}):</span>
                  <span>${completedSale.receivedAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>Change:</span>
                  <span>${completedSale.changeAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="text-center pt-3 text-[10px] text-slate-500 border-t border-dashed border-slate-300 mt-2">
                Thank you! Please come again.
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold flex items-center justify-center space-x-1 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Print Receipt</span>
              </button>
              <button
                onClick={() => {
                  setCompletedSale(null);
                  setIsCheckoutOpen(false);
                }}
                className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                New Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
