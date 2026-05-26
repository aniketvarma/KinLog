// Service worker for push notifications.
// Lives at /sw.js (Vite copies public/ to the build root) so its scope is the
// whole origin — required for push to work across all routes of the app.

// Fires when a push message arrives from a push service (FCM, Mozilla, Apple).
// This runs even when no app tab is open — the browser wakes the SW for us.
self.addEventListener("push", (event) => {
  // Backend sends a JSON payload via web-push. Parse defensively in case
  // the data is missing or malformed.
  const data = event.data?.json() ?? {};

  // Pull the fields the backend sent, with safe fallbacks.
  const title = data.title || "Health Monitor";
  const options = {
    body: data.body || "",
    icon: data.icon || "/favicon.png",
  };

  // waitUntil tells the browser "don't kill this SW until this promise resolves".
  // Without it, the SW might be terminated before the notification actually shows.
  event.waitUntil(self.registration.showNotification(title, options));
});

// Fires when the user clicks an OS notification we showed.
self.addEventListener("notificationclick", (event) => {
  // Close the notification panel/banner.
  event.notification.close();

  // If a /reminders tab is already open, focus it; otherwise open a new tab.
  // Prevents stacking duplicate tabs when the user clicks multiple notifications.
  event.waitUntil(
    (async () => {
      // matchAll returns all browser windows/tabs controlled by (or in scope of)
      // this service worker. includeUncontrolled: true makes sure we also see
      // tabs that loaded BEFORE the SW activated (newly-opened browsers).
      const allClients = await clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      // Look for an existing /reminders tab to focus.
      const existing = allClients.find((c) => c.url.endsWith("/reminders"));

      if (existing) {
        // Bring the existing tab to the front instead of opening a duplicate.
        await existing.focus();
      } else {
        // No /reminders tab open — open a new one.
        await clients.openWindow("/reminders");
      }
    })(),
  );
});
