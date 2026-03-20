import type React from 'react';
import { Menu, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { ThemeToggle } from '../theme/ThemeToggle';

type ShellHeaderProps = {
  collapsed: boolean;
  onToggleSidebar: () => void;
  onOpenMobileNav: () => void;
};

export const ShellHeader: React.FC<ShellHeaderProps> = ({
  collapsed,
  onToggleSidebar,
  onOpenMobileNav,
}) => {
  const { t, i18n } = useTranslation('common');
  const location = useLocation();

  const routes: Record<string, { title: string; description: string }> = {
    '/': { title: t('shellHeader.routes./.title'), description: t('shellHeader.routes./.description') },
    '/chat': { title: t('shellHeader.routes./chat.title'), description: t('shellHeader.routes./chat.description') },
    '/portfolio': { title: t('shellHeader.routes./portfolio.title'), description: t('shellHeader.routes./portfolio.description') },
    '/backtest': { title: t('shellHeader.routes./backtest.title'), description: t('shellHeader.routes./backtest.description') },
    '/settings': { title: t('shellHeader.routes./settings.title'), description: t('shellHeader.routes./settings.description') },
  };

  const current = routes[location.pathname] ?? { title: 'Daily Stock Analysis', description: 'Web workspace' };

  return (
    <header className="sticky top-0 z-30 border-b border-border/60 bg-background/84 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-[1680px] items-center gap-3 px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onOpenMobileNav}
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/70 bg-card/70 text-secondary-text transition-colors hover:bg-hover hover:text-foreground lg:hidden"
          aria-label={t('nav.openMenu')}
        >
          <Menu className="h-5 w-5" />
        </button>

        <button
          type="button"
          onClick={onToggleSidebar}
          className="hidden h-10 w-10 items-center justify-center rounded-xl border border-border/70 bg-card/70 text-secondary-text transition-colors hover:bg-hover hover:text-foreground lg:inline-flex"
          aria-label={collapsed ? t('nav.expandSidebar') : t('nav.collapseSidebar')}
        >
          {collapsed ? <PanelLeftOpen className="h-5 w-5" /> : <PanelLeftClose className="h-5 w-5" />}
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{current.title}</p>
          <p className="truncate text-xs text-secondary-text">{current.description}</p>
        </div>

        <button
          type="button"
          onClick={() => i18n.changeLanguage(i18n.language === 'zh' ? 'en' : 'zh')}
          className="text-xs text-secondary-text hover:text-foreground transition-colors"
        >
          {t('language.toggle')}
        </button>

        <ThemeToggle />
      </div>
    </header>
  );
};
