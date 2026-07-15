import { useNavigate } from 'react-router-dom';
import { Bell, BellOff, Check } from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuth } from '@/context/AuthContext';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { LoadingState } from '@/components/ui/LoadingState';
import { EmptyState } from '@/components/ui/EmptyState';
import { formatDateTime } from '@/utils/format';
import { clsx } from 'clsx';
import type { Notification } from '@/types/database';

export function ClientNotifications() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const openNotification = (n: Notification) => {
    if (!n.read) markAsRead(n.id);
    const aboutReservation = Boolean(n.reservation_id) || (n.type ?? '').includes('reservation');
    if (isAdmin) navigate(aboutReservation ? '/admin/calendario' : '/admin');
    else navigate(aboutReservation ? '/dashboard/prenotazioni' : '/dashboard/notifiche');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="heading-serif text-3xl text-brand-900">Notifiche</h1>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={() => markAllAsRead()}>
            <Check className="h-4 w-4" /> Segna tutte come lette
          </Button>
        )}
      </div>

      {loading ? (
        <LoadingState />
      ) : notifications.length === 0 ? (
        <EmptyState
          title="Nessuna notifica"
          description="Qui vedrai conferme e aggiornamenti delle tue prenotazioni."
          icon={<BellOff className="h-7 w-7" />}
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((n) => (
            <Card
              key={n.id}
              onClick={() => openNotification(n)}
              className={clsx(
                'flex cursor-pointer items-start gap-4 transition hover:border-brand-200 hover:shadow-sm',
                !n.read && 'border-l-4 border-l-accent-500'
              )}
            >
              <div className="mt-0.5 rounded-full bg-brand-100 p-2 text-brand-600">
                <Bell className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-semibold text-brand-900">{n.title}</h3>
                  <span className="whitespace-nowrap text-xs text-brand-400">
                    {formatDateTime(n.created_at)}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-brand-500">{n.message}</p>
              </div>
              {!n.read && (
                <button
                  onClick={(event) => {
                    event.stopPropagation();
                    markAsRead(n.id);
                  }}
                  className="text-xs font-medium text-brand-500 hover:text-brand-800"
                >
                  Segna letta
                </button>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
