import { useEffect } from "react";
import { useNotificationStore } from "@/store/notificationStore";

export default function Toast() {
  const { mensaje, visible, id, hideNotification } = useNotificationStore();

  useEffect(() => {
    if (!visible) return;
    const timer = window.setTimeout(hideNotification, 3000);
    return () => window.clearTimeout(timer);
  }, [visible, id, hideNotification]);

  return (
    <div role="status" aria-atomic="true" className="pointer-events-none fixed right-4 bottom-4 z-[60] max-w-sm">
      {visible && (
        <p className="rounded-xl bg-slate-900 px-4 py-3 text-sm text-white shadow-lg dark:bg-slate-700">
          {mensaje}
        </p>
      )}
    </div>
  );
}
