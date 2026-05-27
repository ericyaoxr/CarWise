import { Car, ClipboardCheck, FileArchive, Home, ReceiptText, ShoppingCart } from 'lucide-react';

import type { Page } from '../App';

interface BottomNavProps {
  current: Page;
  onNavigate: (page: Page) => void;
}

const tabs: Array<{ page: Page; label: string; icon: typeof Home }> = [
  { page: 'home', label: '首页', icon: Home },
  { page: 'purchase', label: '购车', icon: ShoppingCart },
  { page: 'delivery', label: '提车', icon: ClipboardCheck },
  { page: 'usage', label: '用车', icon: ReceiptText },
  { page: 'archive', label: '档案', icon: FileArchive },
];

export function BottomNav({ current, onNavigate }: BottomNavProps) {
  return (
    <nav className="bottom-nav" aria-label="主导航">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        return (
          <button key={tab.page} className={current === tab.page ? 'active' : ''} onClick={() => onNavigate(tab.page)}>
            <Icon size={18} />
            <span>{tab.label}</span>
          </button>
        );
      })}
      <button className={current === 'promises' ? 'active' : ''} onClick={() => onNavigate('promises')}>
        <Car size={18} />
        <span>权益</span>
      </button>
    </nav>
  );
}
