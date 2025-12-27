let editingId = null;
let currentUser = null;
let adminProducts = []; // cache of products for search/filter

function showAlert(containerId, message, type = "error") {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!message) {
    el.innerHTML = "";
    return;
  }
  const cls = type === "error" ? "alert alert-error" : "alert alert-success";
  el.innerHTML = `<div class="${cls}">${message}</div>`;
}

// 🔹 Dashboard metrics in admin.html (now includes revenue)
function updateMetrics(products) {
  const total = products.length;
  const outOfStock = products.filter((p) => !p.in_stock).length;

  const totalEl = document.getElementById("metric-total-products");
  const outEl = document.getElementById("metric-out-of-stock");
  const ordersEl = document.getElementById("metric-orders-count");
  const revenueEl = document.getElementById("metric-total-revenue");

  if (totalEl) totalEl.textContent = total;
  if (outEl) outEl.textContent = outOfStock;

  if (ordersEl || revenueEl) {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((orders) => {
        if (!Array.isArray(orders)) {
          if (ordersEl) ordersEl.textContent = "0";
          if (revenueEl) revenueEl.textContent = "RWF 0";
          return;
        }

        if (ordersEl) {
          ordersEl.textContent = orders.length;
        }

        if (revenueEl) {
          const totalRevenue = orders.reduce((sum, o) => {
            const subtotal = o.subtotal || 0;
            const delivery = o.delivery_fee || 0;
            return sum + subtotal + delivery;
          }, 0);
          revenueEl.textContent =
            totalRevenue.toLocaleString("en-RW") + " RWF";
        }
      })
      .catch(() => {
        if (ordersEl) ordersEl.textContent = "–";
        if (revenueEl) revenueEl.textContent = "RWF 0";
      });
  }
}

async function checkAuth() {
  try {
    const res = await fetch("/api/check-auth");
    if (!res.ok) {
      showLogin();
      return;
    }
    const data = await res.json();
    if (data.isAuthenticated) {
      enterAdmin(data.user);
    } else {
      showLogin();
    }
  } catch (err) {
    console.error("Auth check failed", err);
    showLogin();
  }
}

function showLogin() {
  document.getElementById("login-section").classList.add("show");
  document.getElementById("admin-section").classList.remove("show");
}

async function handleLogin(e) {
  e.preventDefault();
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;
  if (!email || !password) {
    showAlert("login-alert", "Email and password are required");
    return;
  }
  try {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Login failed");
    }
    enterAdmin(data.user);
  } catch (err) {
    console.error(err);
    showAlert("login-alert", err.message || "Login failed");
  }
}

function enterAdmin(user) {
  currentUser = user;
  const loginSection = document.getElementById("login-section");
  const adminSection = document.getElementById("admin-section");
  loginSection.classList.remove("show");
  adminSection.classList.add("show");

  const emailChip = document.getElementById("logged-email");
  if (emailChip) {
    emailChip.textContent = user.email;
  }

  showAlert("login-alert", "");
  loadProducts();
}

async function handleLogout() {
  try {
    await fetch("/api/logout", { method: "POST" });
  } catch (err) {
    console.error("Logout failed", err);
  } finally {
    location.reload();
  }
}

// 🔹 Load products and feed the cache + metrics
async function loadProducts() {
  try {
    const res = await fetch("/api/products");
    if (res.status === 401) {
      handleLogout(); // Session expired or invalid
      return;
    }
    const products = await res.json();
    adminProducts = products || [];
    filterAndRenderProducts(); // apply search/filter
    updateMetrics(adminProducts); // update dashboard metrics
  } catch (err) {
    console.error(err);
    showAlert("admin-alert", "Failed to load products");
  }
}

// 🔹 Filter + search helper
function filterAndRenderProducts() {
  const searchInput = document.getElementById("admin-search");
  const filterSelect = document.getElementById("admin-filter");

  const search = searchInput ? searchInput.value.toLowerCase().trim() : "";
  const filter = filterSelect ? filterSelect.value : "all";

  let list = adminProducts.slice();

  if (search) {
    list = list.filter((p) => {
      const combined =
        (p.name || "") +
        " " +
        (p.category || "") +
        " " +
        (p.description || "");
      return combined.toLowerCase().includes(search);
    });
  }

  if (filter === "active") {
    list = list.filter((p) => p.active);
  } else if (filter === "archived") {
    list = list.filter((p) => !p.active);
  } else if (filter === "promo") {
    list = list.filter((p) => p.is_promo);
  } else if (filter === "out") {
    list = list.filter((p) => !p.in_stock);
  }

  renderProducts(list);
}

function renderProducts(products) {
  const tbody = document.getElementById("products-body");
  tbody.innerHTML = "";

  products.forEach((p) => {
    const tr = document.createElement("tr");
    if (!p.in_stock) {
      tr.classList.add("row-out"); // for subtle out-of-stock highlight
    }

    const tdId = document.createElement("td");
    tdId.textContent = p.id;

    const tdName = document.createElement("td");
    tdName.innerHTML = `<strong>${p.name}</strong><br/><span class="subtext">${
      p.category || ""
    }</span>`;

    const tdPrice = document.createElement("td");
    tdPrice.textContent = (p.price || 0).toLocaleString() + " RWF";

    const tdStock = document.createElement("td");
    tdStock.innerHTML = p.in_stock
      ? '<span class="badge badge-green">In stock</span>'
      : '<span class="badge badge-red">Out</span>';

    const tdStatus = document.createElement("td");
    const badges = [];
    if (p.is_promo) badges.push('<span class="badge badge-promo">Promo</span>');
    badges.push(
      `<span class="badge ${
        p.active ? "badge-green" : "badge-red"
      }">${p.active ? "Active" : "Archived"}</span>`
    );
    tdStatus.innerHTML = badges.join(" ");

    const tdActions = document.createElement("td");
    const editBtn = document.createElement("button");
    editBtn.className = "btn-outline btn-small";
    editBtn.textContent = "Edit";
    editBtn.onclick = () => fillFormForEdit(p);

    const archiveBtn = document.createElement("button");
    archiveBtn.className = "btn-outline btn-small";
    archiveBtn.style.marginLeft = "4px";
    archiveBtn.textContent = p.active ? "Archive" : "Activate";
    archiveBtn.onclick = () => toggleActive(p);

    const delBtn = document.createElement("button");
    delBtn.className = "btn-danger btn-small";
    delBtn.style.marginLeft = "4px";
    delBtn.textContent = "Delete";
    delBtn.onclick = () => deleteProduct(p);

    tdActions.appendChild(editBtn);
    tdActions.appendChild(archiveBtn);
    tdActions.appendChild(delBtn);

    tr.appendChild(tdId);
    tr.appendChild(tdName);
    tr.appendChild(tdPrice);
    tr.appendChild(tdStock);
    tr.appendChild(tdStatus);
    tr.appendChild(tdActions);

    tbody.appendChild(tr);
  });
}

/* ================================
   PRICING LOGIC
   original_price + discount (%) → price
   ================================ */

function getNumberFromInput(id) {
  const el = document.getElementById(id);
  if (!el) return null;
  const raw = el.value.trim();
  if (!raw) return null;
  const n = Number(raw);
  return Number.isNaN(n) ? null : n;
}

function recalcPriceFromOriginalAndDiscount() {
  const original = getNumberFromInput("original_price");
  const discount = getNumberFromInput("discount");

  // need both values
  if (original == null || discount == null) return;
  // sanity checks
  if (discount < 0 || discount >= 100) return;

  const priceEl = document.getElementById("price");
  if (!priceEl) return;

  const newPrice = Math.round(original * (1 - discount / 100));
  priceEl.value = newPrice > 0 ? newPrice : "";

  // auto-mark as promo when there is a discount
  const promoEl = document.getElementById("is_promo");
  if (promoEl && discount > 0) {
    promoEl.checked = true;
  }
}

function wirePricingLogic() {
  const originalEl = document.getElementById("original_price");
  const discountEl = document.getElementById("discount");

  if (originalEl) {
    originalEl.addEventListener("input", recalcPriceFromOriginalAndDiscount);
    originalEl.addEventListener("blur", recalcPriceFromOriginalAndDiscount);
  }

  if (discountEl) {
    discountEl.addEventListener("input", recalcPriceFromOriginalAndDiscount);
    discountEl.addEventListener("blur", recalcPriceFromOriginalAndDiscount);
  }
}

/* ================================
   FORM HELPERS
   ================================ */

function getFormData() {
  const price = getNumberFromInput("price");
  const original_price = getNumberFromInput("original_price");
  const discount = getNumberFromInput("discount");

  const manualPromo = document.getElementById("is_promo").checked;

  return {
    name: document.getElementById("name").value.trim(),
    category: document.getElementById("category").value.trim(),
    price: price,
    original_price: original_price,
    discount: discount,
    // if there is a discount, force promo true; otherwise keep manual checkbox
    is_promo: discount != null && discount > 0 ? true : manualPromo,
    image: document.getElementById("image-url").value.trim(),
    description: document.getElementById("description").value.trim(),
    in_stock: document.getElementById("in_stock").checked,
    active: document.getElementById("active").checked,
  };
}

function clearForm() {
  editingId = null;
  document.getElementById("product-form").reset();
  document.getElementById("active").checked = true;
  document.getElementById("in_stock").checked = true;
  document.getElementById("save-btn").textContent = "Save product";
}

function fillFormForEdit(p) {
  editingId = p.id;
  document.getElementById("name").value = p.name || "";
  document.getElementById("category").value = p.category || "";
  document.getElementById("price").value = p.price || "";
  document.getElementById("original_price").value = p.original_price || "";
  document.getElementById("discount").value = p.discount || "";
  document.getElementById("image-url").value = p.image || "";
  document.getElementById("description").value = p.description || "";
  document.getElementById("in_stock").checked = !!p.in_stock;
  document.getElementById("is_promo").checked = !!p.is_promo;
  document.getElementById("active").checked = !!p.active;

  document.getElementById("save-btn").textContent = "Update product";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function submitProduct(e) {
  e.preventDefault();
  const data = getFormData();
  if (!data.name || data.price == null) {
    showAlert("admin-alert", "Name and price are required");
    return;
  }

  try {
    const method = editingId ? "PUT" : "POST";
    const url = editingId ? `/api/products/${editingId}` : "/api/products";

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.error || "Save failed");
    }

    showAlert(
      "admin-alert",
      editingId ? "Product updated" : "Product created",
      "success"
    );
    clearForm();
    loadProducts();
  } catch (err) {
    console.error(err);
    showAlert("admin-alert", err.message || "Save failed");
  }
}

async function toggleActive(p) {
  try {
    const res = await fetch(`/api/products/${p.id}/active`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ active: !p.active }),
    });
    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.error || "Failed to toggle active");
    }
    loadProducts();
  } catch (err) {
    console.error(err);
    showAlert("admin-alert", err.message || "Failed to toggle active");
  }
}

async function deleteProduct(p) {
  if (!confirm("Delete this product permanently?")) return;
  try {
    const res = await fetch(`/api/products/${p.id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.error || "Failed to delete");
    }
    loadProducts();
  } catch (err) {
    console.error(err);
    showAlert("admin-alert", err.message || "Failed to delete");
  }
}

async function uploadImage(e) {
  const file = e.target.files[0];
  if (!file) return;
  const fd = new FormData();
  fd.append("image", file);
  try {
    const res = await fetch("/api/upload-image", {
      method: "POST",
      body: fd,
    });
    if (!res.ok) {
      const d = await res.json();
      throw new Error(d.error || "Upload failed");
    }
    const data = await res.json();
    document.getElementById("image-url").value = data.url;
    showAlert("admin-alert", "Image uploaded", "success");
  } catch (err) {
    console.error(err);
    showAlert("admin-alert", err.message || "Upload failed");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  checkAuth();
  wirePricingLogic(); // enable original_price + discount → price (+ promo auto-check)

  document
    .getElementById("login-form")
    .addEventListener("submit", handleLogin);
  document
    .getElementById("logout-btn")
    .addEventListener("click", handleLogout);
  document
    .getElementById("product-form")
    .addEventListener("submit", submitProduct);
  document
    .getElementById("clear-btn")
    .addEventListener("click", clearForm);
  document
    .getElementById("image-file")
    .addEventListener("change", uploadImage);

  // 🔹 Wire search + filter
  const searchInput = document.getElementById("admin-search");
  const filterSelect = document.getElementById("admin-filter");

  if (searchInput) {
    searchInput.addEventListener("input", () => filterAndRenderProducts());
  }
  if (filterSelect) {
    filterSelect.addEventListener("change", () => filterAndRenderProducts());
  }
});
