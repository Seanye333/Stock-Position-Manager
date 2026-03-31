import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Bell, BellRing, ArrowUp, ArrowDown } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { getAlerts, getTriggeredAlerts, createAlert, deleteAlert } from '../../api/alerts';
import Button from '../common/Button';
import Modal from '../common/Modal';
import ConfirmDialog from '../common/ConfirmDialog';
import LoadingSpinner from '../common/LoadingSpinner';

export default function AlertsPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [form, setForm] = useState({ ticker: '', target_price: '', direction: 'above' });
  const [lastTriggeredCount, setLastTriggeredCount] = useState(0);

  const { data: alerts, isLoading } = useQuery({ queryKey: ['alerts'], queryFn: () => getAlerts(), refetchInterval: 30_000 });
  const { data: triggered } = useQuery({ queryKey: ['triggeredAlerts'], queryFn: getTriggeredAlerts, refetchInterval: 30_000 });

  // Notify on new triggers
  useEffect(() => {
    if (triggered && triggered.length > lastTriggeredCount && lastTriggeredCount > 0) {
      const newAlerts = triggered.slice(lastTriggeredCount);
      newAlerts.forEach(a => {
        toast(`${a.ticker} hit $${a.currentPrice} (target: $${a.target_price} ${a.direction})`, { icon: '🔔' });
      });
    }
    if (triggered) setLastTriggeredCount(triggered.length);
  }, [triggered]);

  const createMut = useMutation({
    mutationFn: createAlert,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['alerts'] });
      toast.success('Alert created');
      setModalOpen(false);
      setForm({ ticker: '', target_price: '', direction: 'above' });
    },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed'),
  });

  const deleteMut = useMutation({
    mutationFn: deleteAlert,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['alerts'] }); toast.success('Alert deleted'); },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    createMut.mutate({
      ticker: form.ticker.toUpperCase(),
      target_price: parseFloat(form.target_price),
      direction: form.direction,
    });
  };

  if (isLoading) return <LoadingSpinner />;

  const activeAlerts = alerts?.filter(a => a.is_active) || [];
  const triggeredAlerts = alerts?.filter(a => !a.is_active) || [];

  return (
    <div className="animate-fade-in space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Price Alerts</h1>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} /> New Alert
        </Button>
      </div>

      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
          <Bell size={14} /> Active Alerts ({activeAlerts.length})
        </h2>
        {activeAlerts.length === 0 ? (
          <div className="bg-dark-card border border-dark-border rounded-xl p-8 text-center">
            <p className="text-gray-400">No active alerts. Create one to get notified when a stock hits your target price.</p>
          </div>
        ) : (
          <div className="grid gap-3">
            {activeAlerts.map(a => (
              <div key={a.id} className="bg-dark-card border border-dark-border rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={clsx('p-2 rounded-lg', a.direction === 'above' ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-red/10 text-accent-red')}>
                    {a.direction === 'above' ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
                  </div>
                  <div>
                    <span className="text-white font-semibold">{a.ticker}</span>
                    <span className="text-gray-400 text-sm ml-2">
                      {a.direction === 'above' ? 'rises above' : 'drops below'} ${a.target_price.toFixed(2)}
                    </span>
                  </div>
                </div>
                <button onClick={() => setDeleteTarget(a)} className="p-1.5 rounded hover:bg-dark-border text-gray-400 hover:text-accent-red transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {triggeredAlerts.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-2">
            <BellRing size={14} /> Triggered ({triggeredAlerts.length})
          </h2>
          <div className="grid gap-3">
            {triggeredAlerts.map(a => (
              <div key={a.id} className="bg-dark-card/50 border border-dark-border/50 rounded-xl p-4 flex items-center justify-between opacity-60">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-dark-border/30 text-gray-500">
                    {a.direction === 'above' ? <ArrowUp size={18} /> : <ArrowDown size={18} />}
                  </div>
                  <div>
                    <span className="text-gray-300 font-medium">{a.ticker}</span>
                    <span className="text-gray-500 text-sm ml-2">${a.target_price.toFixed(2)} {a.direction}</span>
                    {a.triggered_at && <span className="text-gray-600 text-xs ml-2">Triggered {new Date(a.triggered_at).toLocaleDateString()}</span>}
                  </div>
                </div>
                <button onClick={() => setDeleteTarget(a)} className="p-1.5 rounded hover:bg-dark-border text-gray-400 hover:text-accent-red transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Price Alert">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-400 mb-1">Ticker</label>
            <input type="text" value={form.ticker} onChange={e => setForm(f => ({ ...f, ticker: e.target.value }))} required placeholder="AAPL"
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-accent-blue" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Target Price</label>
            <input type="number" step="0.01" min="0.01" value={form.target_price} onChange={e => setForm(f => ({ ...f, target_price: e.target.value }))} required
              className="w-full bg-dark-bg border border-dark-border rounded-lg px-3 py-2 text-white focus:outline-none focus:border-accent-blue" />
          </div>
          <div>
            <label className="block text-sm text-gray-400 mb-1">Direction</label>
            <div className="flex gap-3">
              <button type="button" onClick={() => setForm(f => ({ ...f, direction: 'above' }))}
                className={clsx('flex-1 p-3 rounded-lg border text-sm font-medium transition-colors', form.direction === 'above' ? 'border-accent-green bg-accent-green/10 text-accent-green' : 'border-dark-border text-gray-400 hover:bg-dark-hover')}>
                <ArrowUp size={16} className="inline mr-1" /> Rises Above
              </button>
              <button type="button" onClick={() => setForm(f => ({ ...f, direction: 'below' }))}
                className={clsx('flex-1 p-3 rounded-lg border text-sm font-medium transition-colors', form.direction === 'below' ? 'border-accent-red bg-accent-red/10 text-accent-red' : 'border-dark-border text-gray-400 hover:bg-dark-hover')}>
                <ArrowDown size={16} className="inline mr-1" /> Drops Below
              </button>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="ghost" type="button" onClick={() => setModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Alert</Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMut.mutate(deleteTarget.id)}
        title="Delete Alert"
        message={`Delete this alert for ${deleteTarget?.ticker}?`}
      />
    </div>
  );
}
