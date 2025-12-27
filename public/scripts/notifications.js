// Simple global polling-based order notification for admin pages

let kbLastMaxOrderId = null;
let kbPollingStarted = false;

async function kbFetchOrders() {
  const res = await fetch("/api/orders");
  if (!res.ok) throw new Error("Failed to fetch orders");
  return await res.json();
}

function kbShowNotification(message) {
  // Create container once
  let root = document.getElementById("kb-notification-root");
  if (!root) {
    root = document.createElement("div");
    root.id = "kb-notification-root";
    root.style.position = "fixed";
    root.style.top = "1rem";
    root.style.right = "1rem";
    root.style.zIndex = "9999";
    root.style.maxWidth = "260px";
    document.body.appendChild(root);
  }

  root.innerHTML = `<div class="alert alert-success">${message}</div>`;

  // Hide after a few seconds
  setTimeout(() => {
    if (root) root.innerHTML = "";
  }, 8000);
}

async function kbCheckNewOrders() {
  try {
    const orders = await kbFetchOrders();
    if (!Array.isArray(orders)) return;

    const maxId = orders.reduce(
      (max, o) => Math.max(max, o.id || 0),
      0
    );

    // First time: just set baseline and don't notify
    if (kbLastMaxOrderId === null) {
      kbLastMaxOrderId = maxId;
      return;
    }

    if (maxId > kbLastMaxOrderId) {
      // Count how many are new
      const newCount = orders.filter(
        (o) => (o.id || 0) > kbLastMaxOrderId
      ).length;

      kbLastMaxOrderId = maxId;

      const msg =
        newCount === 1
          ? "New order received!"
          : `${newCount} new orders received!`;

      kbShowNotification(msg);

      // 🔔 Optional: sound, if <audio id="kb-new-order-sound"> exists
      const audio = document.getElementById("kb-new-order-sound");
      if (audio) {
        audio.currentTime = 0;
        audio.play().catch(() => {});
      }

      // ⭐ IMPORTANT: if the page defines a handler, call it
      if (typeof window.kbOnNewOrders === "function") {
        window.kbOnNewOrders();
      }
    }
  } catch (err) {
    console.error("Failed to check for new orders:", err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (kbPollingStarted) return;
  kbPollingStarted = true;

  // Initial run + polling every 15s
  kbCheckNewOrders();
  setInterval(kbCheckNewOrders, 15000);
});
