import { Download, Camera } from 'lucide-react';
import Button from '../common/Button';
import toast from 'react-hot-toast';
import { captureSnapshot } from '../../api/portfolio';

export default function Header() {
  const handleExportPositions = () => {
    window.open('/api/export/positions', '_blank');
  };

  const handleExportDividends = () => {
    window.open('/api/export/dividends', '_blank');
  };

  const handleSnapshot = async () => {
    try {
      await captureSnapshot();
      toast.success('Portfolio snapshot captured');
    } catch {
      toast.error('Failed to capture snapshot');
    }
  };

  return (
    <header className="h-14 border-b border-dark-border flex items-center justify-between px-6 bg-dark-card">
      <div />
      <div className="flex items-center gap-2">
        <Button variant="ghost" onClick={handleSnapshot} className="text-xs">
          <Camera size={14} /> Snapshot
        </Button>
        <Button variant="ghost" onClick={handleExportPositions} className="text-xs">
          <Download size={14} /> Export Positions
        </Button>
        <Button variant="ghost" onClick={handleExportDividends} className="text-xs">
          <Download size={14} /> Export Dividends
        </Button>
      </div>
    </header>
  );
}
