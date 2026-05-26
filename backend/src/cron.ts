import cron from "node-cron";
import webpush from "web-push";
import db from "./db.js";

import logger from "./utils/logger.js";

webpush.setVapidDetails(
  process.env.VAPID_SUBJECT!,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
);

let running = false;

export function startReminderCron() {
  cron.schedule("* * * * *", async () => {
    if (running) return;
    running = true;

    try {
      const dues = await db.any(
        `SELECT id, user_id, message, frequency
         FROM reminders
         WHERE due_at <= NOW() AND notified_at IS NULL`,
      );

      for (const due of dues) {
        const subs = await db.any(
          `SELECT endpoint, p256dh, auth
           FROM push_subscriptions WHERE user_id = $1`,
          [due.user_id],
        );

        const payload = JSON.stringify({
          title: "KinLog",
          body: due.message,
          icon: "/favicon.png",
        });

        for (const sub of subs) {
          try {
            await webpush.sendNotification(
              {
                endpoint: sub.endpoint,
                keys: { p256dh: sub.p256dh, auth: sub.auth },
              },
              payload,
            );
          } catch (err: any) {
            if (err.statusCode === 404 || err.statusCode === 410) {
              // Browser revoked this subscription. Drop the row.
              await db.none(
                `DELETE FROM push_subscriptions WHERE endpoint = $1`,
                [sub.endpoint],
              );
            } else {
              console.error("Push send failed:", err.statusCode, err.body);
            }
          }
        }

        if (due.frequency === "once") {
          await db.none(
            `UPDATE reminders SET notified_at= NOW() WHERE id=$1 `,
            [due.id],
          );
        } else if (due.frequency === "daily") {
          // Jump to the next future occurrence. CEIL((now - due_at) / 1 day)
          // tells us how many whole days have passed; add that many. One push,
          // schedule cleanly jumps forward even for very stale rows.
          await db.none(
            `UPDATE reminders
             SET due_at = due_at + INTERVAL '1 day' *
                          CEIL(EXTRACT(EPOCH FROM (NOW() - due_at)) / 86400)::int
             WHERE id = $1`,
            [due.id],
          );
        } else if (due.frequency === "weekly") {
          await db.none(
            `UPDATE reminders
             SET due_at = due_at + INTERVAL '7 days' *
                          CEIL(EXTRACT(EPOCH FROM (NOW() - due_at)) / 604800)::int
             WHERE id = $1`,
            [due.id],
          );
        }
      }
    } catch (err) {
      logger.error("Cron tick failed:");
    } finally {
      running = false;
    }
  });

  logger.info("Reminder cron started (every 1 minute).");
}
