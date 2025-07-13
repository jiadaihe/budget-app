import { useRegisterSW } from "virtual:pwa-register/react";

export default function PWAToast() {
  // check for updates every hour
  const period = 60 * 60 * 1000;

  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(swUrl, r) {
      if (period <= 0) return;
      if (r?.active?.state === "activated") {
        registerPeriodicSync(period, swUrl, r);
      } else if (r?.installing) {
        r.installing.addEventListener("statechange", (e) => {
          const sw = e.target as ServiceWorker;
          if (sw.state === "activated") registerPeriodicSync(period, swUrl, r);
        });
      }
    },
  });

  function close() {
    setOfflineReady(false);
    setNeedRefresh(false);
  }

  return (
    // The main container for the toast, positioned at the end (bottom-right by default)
    <div className="toast toast-end" role="alert" aria-labelledby="toast-message">
      {(offlineReady || needRefresh) && (
        // The actual alert message box
        <div
          className={`alert ${
            offlineReady ? "alert-info" : "alert-warning"
          } shadow-lg`}
        >
          <div>
            {offlineReady ? (
              <span id="toast-message">App ready to work offline</span>
            ) : (
              <span id="toast-message">
                New content available, click on reload button to update.
              </span>
            )}
          </div>
          {/* Buttons within the alert, using flexbox for layout */}
          <div className="flex gap-2">
            {needRefresh && (
              <button className="btn btn-sm" onClick={() => updateServiceWorker(true)}>
                Reload
              </button>
            )}
            <button className="btn btn-sm" onClick={() => close()}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * This function will register a periodic sync check every hour, you can modify the interval as needed.
 */
function registerPeriodicSync(
  period: number,
  swUrl: string,
  r: ServiceWorkerRegistration,
) {
  if (period <= 0) return;

  setInterval(async () => {
    if ("onLine" in navigator && !navigator.onLine) return;

    const resp = await fetch(swUrl, {
      cache: "no-store",
      headers: {
        cache: "no-store",
        "cache-control": "no-cache",
      },
    });

    if (resp?.status === 200) await r.update();
  }, period);
}