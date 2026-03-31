import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, DollarSign } from 'lucide-react';
import toast from 'react-hot-toast';
import { getDividends, getDividendSummary, createDividend, deleteDividend } from '../../api/dividends';
import { getPositions } from '../../api/positions';
import Button from '../common/Button';
import Modal from '../common/Modal';
import ConfirmDialog from '../common/ConfirmDialog';
import LoadingSpinner from '../common/LoadingSpinner';

export default function DividendsPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ position_id: '', amount_per_share: '', ex_date: '', pay_date: '' });

  const { data: dividends, isLoading } = useQuery({ queryKey: ['dividends'], queryFn: () => getDividends() });
  const { data: summary } = useQuery({ queryKey: ['dividendSummary'], queryFn: getDividendSummary });
  const { data: positions } = useQuery({ queryKey: ['positions'], queryFn: getPositions });

  const createMut = useMutation({
    mutationFn: createDividend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dividends'] });
      queryClient.invalidateQueries({ queryKey: ['dividendSummary'] });
      queryClient.invalidateQueries({ queryKey: ['portfolioSummary'] });
      toast.success('Dividend recorded');
      setModalOpen(false);
      setForm({ position_id: '', amount_per_share: '', ex_date: '', pay_date: '' });
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  });

  const deleteMut = useMutation({
    mutationFn: deleteDividend,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dividends'] });
      queryClient.invalidateQueries({ queryKey: ['dividendSummary'] });
      toast.success('Dividend deleted');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMut.mutate({
      position_id: parseInt(form.position_id),
      amount_per_share: parseFloat(form.amount_per_share),
      ex_date: form.ex_date,
      pay_date: form.pay_date || null,
    });
  };

  if (isLoading) return <LoadingSpinner />;

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Dividends</h1>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Record Dividend
        </Button>
      </div>

      {summary && (
        <div className="bg-dark-card border border-dark-border rounded-xl p-5">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 rounded-lg bg-accent-purple/10 text-accent-purple"><DollarSign size={20} /></div>
            <div>
              <p className="text-sm text-gray-400">Total Dividend Income</p>
              <p className="text-xl font-bold text-white">${summary.totalIncome.toFixed(2)}</p>
            </div>
          </div>
          {summary.byPosition.length > 0 && (
            <div className="mt-4 space-y-2">
              {summary.byPosition.map((s, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-300">{s.ticker}</span>
                  <span className="text-white">${s.total_income.toFixed(2)} ({s.payment_count} payments)</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {dividends && dividends.length > 0 ? (
        <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dark-border">
                {['Ticker', 'Amount/Share', 'Ex-Date', 'Pay Date', ''].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dividends.map(d => (
                <tr key={d.id} className="border-b border-dark-border/50 hover:bg-dark-hover transition-colors">
                  <td className="px-4 py-3 text-white font-medium">{d.ticker}</td>
                  <td className="px-4 py-3 text-accent-green">${d.amount_per_share.toFixed(4)}</td>
                  <td className="px-4 py-3 text-gray-300">{d.ex_date}</td>
                  <td className="px-4 py-3 text-gray-300">{d.pay_date || '-'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setDeleteTarget(d)} className="p-1.5 rounded hover:bg-dark-border text-gray-400 hover:text-accent-red transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-dark-card border border-dark-border rounded-xl p-12 text-center">
          <p className="text-gray-400">No dividends recorded yet.</p>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Record Dividend">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Position</label>
            <select
              value={form.position_id} onChange={e => setForm(f => ({ ...f, position_id: e.target.value }))} required
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent-blue"
            >
              <option value="">Select position...</option>
              {positions?.map(p => <option key={p.id} value={p.id}>{p.ticker} ({p.shares} shares)</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Amount Per Share</label>
            <input type="number" step="0.0001" min="0.0001" value={form.amount_per_share}
              onChange={e => setForm(f => ({ ...f, amount_per_share: e.target.value }))} required
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent-blue"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">Ex-Date</label>
              <input type="date" value={form.ex_date} onChange={e => setForm(f => ({ ...f, ex_date: e.target.value }))} required
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent-blue" />
            </div>
            <div>
              <label className="block text-sm text-gray-400 mb-1">Pay Date</label>
              <input type="date" value={form.pay_date} onChange={e => setForm(f => ({ ...f, pay_date: e.target.value }))}
                className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent-blue" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">Record</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMut.mutate(deleteTarget.id)}
        title="Delete Dividend"
        message={`Delete this dividend record for ${deleteTarget?.ticker}?`}
      />
    </div>
  );
}
