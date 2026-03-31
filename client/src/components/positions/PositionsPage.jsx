import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import toast from 'react-hot-toast';
import { getPortfolioSummary } from '../../api/portfolio';
import { createPosition, updatePosition, deletePosition } from '../../api/positions';
import Button from '../common/Button';
import Modal from '../common/Modal';
import ConfirmDialog from '../common/ConfirmDialog';
import PositionForm from './PositionForm';
import LoadingSpinner from '../common/LoadingSpinner';

export default function PositionsPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPosition, setEditingPosition] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['portfolioSummary'],
    queryFn: getPortfolioSummary,
    refetchInterval: 60_000,
  });

  const createMut = useMutation({
    mutationFn: createPosition,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['portfolioSummary'] }); toast.success('Position added'); setModalOpen(false); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed to add'),
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => updatePosition(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['portfolioSummary'] }); toast.success('Position updated'); setEditingPosition(null); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed to update'),
  });

  const deleteMut = useMutation({
    mutationFn: deletePosition,
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['portfolioSummary'] }); toast.success('Position deleted'); },
    onError: (e) => toast.error(e.response?.data?.error || 'Failed to delete'),
  });

  if (isLoading) return <LoadingSpinner />;

  const positions = data?.positions || [];

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">Positions</h1>
        <Button onClick={() => setModalOpen(true)}>
          <Plus size={16} /> Add Position
        </Button>
      </div>

      {positions.length === 0 ? (
        <div className="bg-dark-card border border-dark-border rounded-xl p-12 text-center">
          <p className="text-gray-400">No positions yet. Add your first stock position to get started.</p>
        </div>
      ) : (
        <div className="bg-dark-card border border-dark-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-dark-border">
                  {['Ticker', 'Shares', 'Buy Price', 'Current', 'Market Value', 'Gain/Loss', 'G/L %', 'Day Chg', 'Sector', ''].map(h => (
                    <th key={h} className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-3">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {positions.map(p => (
                  <tr key={p.id} className="border-b border-dark-border/50 hover:bg-dark-hover transition-colors">
                    <td className="px-4 py-3">
                      <span className="text-white font-semibold">{p.ticker}</span>
                      <span className="text-gray-500 text-xs block">{p.name}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-300">{p.shares}</td>
                    <td className="px-4 py-3 text-gray-300">${p.buy_price.toFixed(2)}</td>
                    <td className="px-4 py-3 text-white font-medium">${p.currentPrice.toFixed(2)}</td>
                    <td className="px-4 py-3 text-white">${p.marketValue.toFixed(2)}</td>
                    <td className={clsx('px-4 py-3 font-medium', p.gainLoss >= 0 ? 'text-accent-green' : 'text-accent-red')}>
                      {p.gainLoss >= 0 ? '+' : ''}${p.gainLoss.toFixed(2)}
                    </td>
                    <td className={clsx('px-4 py-3 font-medium', p.gainLossPct >= 0 ? 'text-accent-green' : 'text-accent-red')}>
                      {p.gainLossPct >= 0 ? '+' : ''}{p.gainLossPct.toFixed(2)}%
                    </td>
                    <td className={clsx('px-4 py-3 text-sm', p.dayChange >= 0 ? 'text-accent-green' : 'text-accent-red')}>
                      {p.dayChange >= 0 ? '+' : ''}${p.dayChange.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-sm">{p.sector || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <button onClick={() => setEditingPosition(p)} className="p-1.5 rounded hover:bg-dark-border text-gray-400 hover:text-white transition-colors">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => setDeleteTarget(p)} className="p-1.5 rounded hover:bg-dark-border text-gray-400 hover:text-accent-red transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Add Position">
        <PositionForm onSubmit={(data) => createMut.mutate(data)} onCancel={() => setModalOpen(false)} />
      </Modal>

      <Modal isOpen={!!editingPosition} onClose={() => setEditingPosition(null)} title="Edit Position">
        <PositionForm
          position={editingPosition}
          onSubmit={(data) => updateMut.mutate({ id: editingPosition.id, data })}
          onCancel={() => setEditingPosition(null)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMut.mutate(deleteTarget.id)}
        title="Delete Position"
        message={`Are you sure you want to delete your ${deleteTarget?.ticker} position? This will also delete associated dividends.`}
      />
    </div>
  );
}
