import {
  useNotifications,
  type Notification,
} from "../../context/NotificationContext";
import { X, Bell, Check, CheckCheck, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface NotificationPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationPanel = ({ isOpen, onClose }: NotificationPanelProps) => {
  const {
    notifications,
    markAsRead,
    markAllAsRead,
    clearNotification,
    clearAll,
  } = useNotifications();

  if (!isOpen) return null;

  const getTypeStyles = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "bg-primary/10 border-primary/20 text-primary";
      case "error":
        return "bg-destructive/10 border-destructive/20 text-destructive";
      case "warning":
        return "bg-amber-500/10 border-amber-500/20 text-amber-500";
      default:
        return "bg-blue-500/10 border-blue-500/20 text-blue-500";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="relative w-full max-w-md h-full bg-background shadow-elevated overflow-hidden animate-in slide-in-from-right">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">Notifications</h2>
          </div>
          <div className="flex items-center gap-2">
            {notifications.length > 0 && (
              <>
                <button
                  onClick={markAllAsRead}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                  title="Mark all as read"
                >
                  <CheckCheck className="w-4 h-4 text-muted-foreground" />
                </button>
                <button
                  onClick={clearAll}
                  className="p-2 hover:bg-muted rounded-full transition-colors"
                  title="Clear all"
                >
                  <Trash2 className="w-4 h-4 text-muted-foreground" />
                </button>
              </>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-foreground" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="overflow-y-auto h-[calc(100%-64px)]">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <Bell className="w-12 h-12 mb-4 opacity-30" />
              <p>No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 transition-colors ${
                    !notification.read ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-2 h-2 rounded-full mt-2 ${
                        !notification.read ? "bg-primary" : "bg-transparent"
                      }`}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span
                            className={`inline-block px-2 py-0.5 text-xs rounded-full mb-1 ${getTypeStyles(
                              notification.type
                            )}`}
                          >
                            {notification.type}
                          </span>
                          <h4 className="font-semibold text-foreground">
                            {notification.title}
                          </h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            {notification.message}
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {formatDistanceToNow(notification.createdAt, {
                              addSuffix: true,
                            })}
                          </p>
                        </div>
                        <div className="flex items-center gap-1">
                          {!notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1.5 hover:bg-muted rounded-full transition-colors"
                              title="Mark as read"
                            >
                              <Check className="w-4 h-4 text-muted-foreground" />
                            </button>
                          )}
                          <button
                            onClick={() => clearNotification(notification.id)}
                            className="p-1.5 hover:bg-muted rounded-full transition-colors"
                            title="Remove"
                          >
                            <X className="w-4 h-4 text-muted-foreground" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationPanel;
