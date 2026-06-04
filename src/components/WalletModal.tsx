import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { X, CreditCard, Landmark, Check, Loader2, Copy, Sparkles } from 'lucide-react';

interface WalletModalProps {
  onClose: () => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({ onClose }) => {
  const { deposit } = useApp();
  const [amount, setAmount] = useState<number>(50);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'crypto'>('card');
  const [cryptoType, setCryptoType] = useState<'btc' | 'usdt'>('btc');
  
  // Card Inputs
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardName, setCardName] = useState('GABBY DEVELOPER');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');

  // Simulation Status
  const [status, setStatus] = useState<'idle' | 'processing' | 'success'>('idle');
  const [copied, setCopied] = useState(false);

  const finalAmount = customAmount ? parseFloat(customAmount) || 0 : amount;

  const cryptoAddresses = {
    btc: 'bc1qxy2kg3j4g2k3jlkw9n28490sdj8w9snf0q79al',
    usdt: '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(cryptoAddresses[cryptoType]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateDeposit = (e: React.FormEvent) => {
    e.preventDefault();
    if (finalAmount <= 0) {
      alert('Please select or input a valid deposit amount.');
      return;
    }

    setStatus('processing');
    
    setTimeout(() => {
      setStatus('success');
      const methodLabel = paymentMethod === 'card' 
        ? `Card ending in ${cardNumber.slice(-4)}`
        : `${cryptoType.toUpperCase()} Transfer`;
      
      deposit(finalAmount, methodLabel);

      setTimeout(() => {
        onClose();
      }, 1500);
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
      {/* Modal Container */}
      <div 
        className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden glass flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-purple-400" />
            <h2 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-mono">Simulate Deposit</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-800 transition duration-200 cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        {status === 'success' ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-950 border border-emerald-500 flex items-center justify-center text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <Check size={32} className="animate-bounce" />
            </div>
            <div>
              <h3 className="text-slate-100 font-semibold text-base">Deposit Authorized</h3>
              <p className="text-xs text-slate-400 mt-1 font-mono">
                +${finalAmount.toFixed(2)} Credits Added Successfully
              </p>
            </div>
          </div>
        ) : status === 'processing' ? (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-4">
            <Loader2 className="w-10 h-10 text-cyan-400 animate-spin" />
            <div>
              <h3 className="text-slate-100 font-semibold text-sm">Validating Transaction...</h3>
              <p className="text-[11px] text-slate-500 font-mono mt-1">
                Awaiting simulated payment gateway confirmation
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSimulateDeposit} className="p-5 space-y-4 text-left">
            {/* Amount Selection */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">Select Credit Amount</label>
              <div className="grid grid-cols-4 gap-2">
                {[10, 25, 50, 100].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => {
                      setAmount(val);
                      setCustomAmount('');
                    }}
                    className={`py-2 text-xs font-semibold rounded-lg font-mono border transition ${
                      amount === val && !customAmount
                        ? 'bg-purple-950/40 border-purple-500 text-purple-300 shadow-[0_0_10px_rgba(168,85,247,0.15)]'
                        : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    ${val}
                  </button>
                ))}
              </div>
              <input
                type="number"
                placeholder="Or Enter Custom Amount ($)"
                value={customAmount}
                onChange={(e) => {
                  setCustomAmount(e.target.value);
                  setAmount(0);
                }}
                className="w-full px-3 py-2 text-xs rounded-lg bg-slate-950 border border-slate-800 text-slate-200 font-mono focus:outline-none focus:border-purple-500"
              />
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider font-mono">Payment Gateway</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg border transition ${
                    paymentMethod === 'card'
                      ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <CreditCard size={14} /> Credit Card
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('crypto')}
                  className={`flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg border transition ${
                    paymentMethod === 'crypto'
                      ? 'bg-cyan-950/40 border-cyan-500 text-cyan-300'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Landmark size={14} /> Crypto Wallet
                </button>
              </div>
            </div>

            {/* Payment Details Form */}
            {paymentMethod === 'card' ? (
              <div className="space-y-3 bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80">
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-500 font-mono uppercase">Card Number</span>
                  <input
                    type="text"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800/80 rounded px-2 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 font-mono uppercase">Expiry</span>
                    <input
                      type="text"
                      required
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800/80 rounded px-2 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 font-mono uppercase">CVV</span>
                    <input
                      type="text"
                      required
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800/80 rounded px-2 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[9px] text-slate-500 font-mono uppercase">Cardholder Name</span>
                  <input
                    type="text"
                    required
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800/80 rounded px-2 py-1.5 text-xs font-mono text-slate-300 focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3 bg-slate-950/50 p-3.5 rounded-xl border border-slate-800/80">
                <div className="flex justify-center gap-2 mb-1">
                  <button
                    type="button"
                    onClick={() => setCryptoType('btc')}
                    className={`px-3 py-1 rounded text-[10px] font-bold font-mono ${
                      cryptoType === 'btc' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-slate-950 text-slate-500'
                    }`}
                  >
                    BTC
                  </button>
                  <button
                    type="button"
                    onClick={() => setCryptoType('usdt')}
                    className={`px-3 py-1 rounded text-[10px] font-bold font-mono ${
                      cryptoType === 'usdt' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-slate-950 text-slate-500'
                    }`}
                  >
                    USDT (ERC-20)
                  </button>
                </div>
                
                {/* Simulated QR Code */}
                <div className="flex flex-col items-center py-2 bg-white/5 rounded-lg border border-white/5">
                  <svg className="w-24 h-24 text-slate-200" viewBox="0 0 100 100" fill="currentColor">
                    <rect x="10" y="10" width="20" height="20" />
                    <rect x="70" y="10" width="20" height="20" />
                    <rect x="10" y="70" width="20" height="20" />
                    <rect x="15" y="15" width="10" height="10" fill="#000" />
                    <rect x="75" y="15" width="10" height="10" fill="#000" />
                    <rect x="15" y="75" width="10" height="10" fill="#000" />
                    {/* Random patterns */}
                    <rect x="40" y="10" width="10" height="5" />
                    <rect x="45" y="25" width="15" height="10" />
                    <rect x="10" y="45" width="20" height="10" />
                    <rect x="70" y="45" width="10" height="20" />
                    <rect x="40" y="70" width="15" height="15" />
                    <rect x="80" y="80" width="10" height="10" />
                  </svg>
                  <span className="text-[9px] text-slate-500 font-mono mt-1">Scan address to send transfer</span>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] text-slate-500 font-mono uppercase">Deposit Address</span>
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      readOnly
                      value={cryptoAddresses[cryptoType]}
                      className="w-full bg-slate-950 border border-slate-800/80 rounded px-2 py-1.5 text-[9px] font-mono text-slate-400 focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCopyAddress}
                      className="p-1.5 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-100 transition"
                    >
                      {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Confirm deposit */}
            <button
              type="submit"
              className="w-full py-2.5 px-4 rounded-xl bg-purple-500 hover:bg-purple-400 text-slate-950 text-xs font-bold transition duration-200 shadow-[0_0_15px_rgba(168,85,247,0.3)] hover:shadow-[0_0_20px_rgba(168,85,247,0.5)] flex items-center justify-center gap-1.5 cursor-pointer"
            >
              Simulate Deposit of ${finalAmount.toFixed(2)}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
