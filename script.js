// ============================================================
//  ⚙️  SUPABASE CONFIGURATION
//  Replace the values below with your own Supabase credentials.
//  You can find them in: Supabase Dashboard → Settings → API
// ============================================================
const SUPABASE_URL = 'https://atzzxkcaiwfsvjjnfyra.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImF0enp4a2NhaXdmc3Zqam5meXJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU1NDYzOTksImV4cCI6MjA5MTEyMjM5OX0.GIGHCcMcPVWD5jwdz9CsciTRbfiEB3JPQ-wsVna9Zno';

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ============================================================
//  🧭  NAVIGATION
// ============================================================
const navItems = document.querySelectorAll('.nav-item');
const pages = document.querySelectorAll('.page');

navItems.forEach(item => {
  item.addEventListener('click', () => {
    const target = item.dataset.page;

    navItems.forEach(n => n.classList.remove('active'));
    item.classList.add('active');

    pages.forEach(p => p.classList.remove('active'));
    document.getElementById(`page-${target}`).classList.add('active');

    // Load data when switching pages
    loadPageData(target);
  });
});

function loadPageData(page) {
  switch (page) {
    case 'products':  fetchProducts(); break;
    case 'suppliers': fetchSuppliers(); break;
    case 'orders':    fetchOrders(); loadOrderDropdowns(); break;
    case 'stock':     fetchStock(); break;
    case 'payments':  fetchPayments(); loadPaymentDropdowns(); break;
  }
}

// ============================================================
//  🔔  TOAST NOTIFICATIONS
// ============================================================
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

// ============================================================
//  🏷️  PRODUCTS — CRUD
// ============================================================
const productForm = document.getElementById('product-form');
const productsTableBody = document.getElementById('products-table-body');

productForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const product = {
    product_name: document.getElementById('prod-name').value.trim(),
    category:     document.getElementById('prod-category').value.trim(),
    unit_price:   parseFloat(document.getElementById('prod-price').value),
  };

  const { error } = await supabase.from('product').insert([product]);

  if (error) {
    showToast('Error adding product: ' + error.message, 'error');
    return;
  }

  showToast('Product added successfully!', 'success');
  productForm.reset();
  fetchProducts();
});

async function fetchProducts() {
  const { data, error } = await supabase
    .from('product')
    .select('*')
    .order('product_id', { ascending: true });

  if (error) {
    showToast('Error fetching products: ' + error.message, 'error');
    return;
  }

  if (!data || data.length === 0) {
    productsTableBody.innerHTML = `<tr><td colspan="4" class="empty-state"><div class="empty-icon">📦</div>No products yet</td></tr>`;
    return;
  }

  productsTableBody.innerHTML = data.map(p => `
    <tr>
      <td>${p.product_id}</td>
      <td>${p.product_name}</td>
      <td>${p.category}</td>
      <td>₹${parseFloat(p.unit_price).toFixed(2)}</td>
    </tr>
  `).join('');
}

// ============================================================
//  🏭  SUPPLIERS — CRUD
// ============================================================
const supplierForm = document.getElementById('supplier-form');
const suppliersTableBody = document.getElementById('suppliers-table-body');

supplierForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const supplier = {
    supplier_name: document.getElementById('sup-name').value.trim(),
    phone:         document.getElementById('sup-phone').value.trim(),
    email:         document.getElementById('sup-email').value.trim(),
  };

  const { error } = await supabase.from('supplier').insert([supplier]);

  if (error) {
    showToast('Error adding supplier: ' + error.message, 'error');
    return;
  }

  showToast('Supplier added successfully!', 'success');
  supplierForm.reset();
  fetchSuppliers();
});

async function fetchSuppliers() {
  const { data, error } = await supabase
    .from('supplier')
    .select('*')
    .order('supplier_id', { ascending: true });

  if (error) {
    showToast('Error fetching suppliers: ' + error.message, 'error');
    return;
  }

  if (!data || data.length === 0) {
    suppliersTableBody.innerHTML = `<tr><td colspan="4" class="empty-state"><div class="empty-icon">🏭</div>No suppliers yet</td></tr>`;
    return;
  }

  suppliersTableBody.innerHTML = data.map(s => `
    <tr>
      <td>${s.supplier_id}</td>
      <td>${s.supplier_name}</td>
      <td>${s.phone}</td>
      <td>${s.email}</td>
    </tr>
  `).join('');
}

// ============================================================
//  📋  PURCHASE ORDERS — CRUD + JOIN
// ============================================================
const orderForm = document.getElementById('order-form');
const ordersTableBody = document.getElementById('orders-table-body');

// Populate dropdowns with existing products & suppliers
async function loadOrderDropdowns() {
  const productSelect  = document.getElementById('order-product');
  const supplierSelect = document.getElementById('order-supplier');

  // Fetch products
  const { data: products } = await supabase.from('product').select('product_id, product_name');
  productSelect.innerHTML = '<option value="">Select product...</option>';
  if (products) {
    products.forEach(p => {
      productSelect.innerHTML += `<option value="${p.product_id}">${p.product_name}</option>`;
    });
  }

  // Fetch suppliers
  const { data: suppliers } = await supabase.from('supplier').select('supplier_id, supplier_name');
  supplierSelect.innerHTML = '<option value="">Select supplier...</option>';
  if (suppliers) {
    suppliers.forEach(s => {
      supplierSelect.innerHTML += `<option value="${s.supplier_id}">${s.supplier_name}</option>`;
    });
  }
}

orderForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const order = {
    product_id:  parseInt(document.getElementById('order-product').value),
    supplier_id: parseInt(document.getElementById('order-supplier').value),
    quantity:    parseInt(document.getElementById('order-qty').value),
    order_date:  document.getElementById('order-date').value,
  };

  const { error } = await supabase.from('purchase_order').insert([order]);

  if (error) {
    showToast('Error creating order: ' + error.message, 'error');
    return;
  }

  showToast('Order created successfully!', 'success');
  orderForm.reset();
  fetchOrders();
});

// JOIN query — fetch orders with product and supplier names
async function fetchOrders() {
  const { data, error } = await supabase
    .from('purchase_order')
    .select(`
      order_id,
      quantity,
      order_date,
      product ( product_name ),
      supplier ( supplier_name )
    `)
    .order('order_id', { ascending: true });

  if (error) {
    // Fallback: if foreign key join fails, fetch separately and map
    console.warn('Join failed, falling back to manual mapping:', error.message);
    await fetchOrdersFallback();
    return;
  }

  if (!data || data.length === 0) {
    ordersTableBody.innerHTML = `<tr><td colspan="5" class="empty-state"><div class="empty-icon">📋</div>No orders yet</td></tr>`;
    return;
  }

  ordersTableBody.innerHTML = data.map(o => `
    <tr>
      <td>${o.order_id}</td>
      <td>${o.product?.product_name || '—'}</td>
      <td>${o.supplier?.supplier_name || '—'}</td>
      <td>${o.quantity}</td>
      <td>${o.order_date}</td>
    </tr>
  `).join('');
}

// Fallback: fetch orders, products, suppliers separately and map
async function fetchOrdersFallback() {
  const [ordersRes, productsRes, suppliersRes] = await Promise.all([
    supabase.from('purchase_order').select('*').order('order_id', { ascending: true }),
    supabase.from('product').select('product_id, product_name'),
    supabase.from('supplier').select('supplier_id, supplier_name'),
  ]);

  if (ordersRes.error) {
    showToast('Error fetching orders: ' + ordersRes.error.message, 'error');
    return;
  }

  const orders    = ordersRes.data || [];
  const products  = Object.fromEntries((productsRes.data || []).map(p => [p.product_id, p.product_name]));
  const suppliers = Object.fromEntries((suppliersRes.data || []).map(s => [s.supplier_id, s.supplier_name]));

  if (orders.length === 0) {
    ordersTableBody.innerHTML = `<tr><td colspan="5" class="empty-state"><div class="empty-icon">📋</div>No orders yet</td></tr>`;
    return;
  }

  ordersTableBody.innerHTML = orders.map(o => `
    <tr>
      <td>${o.order_id}</td>
      <td>${products[o.product_id] || '—'}</td>
      <td>${suppliers[o.supplier_id] || '—'}</td>
      <td>${o.quantity}</td>
      <td>${o.order_date}</td>
    </tr>
  `).join('');
}

// ============================================================
//  📊  STOCK — READ + UPDATE
// ============================================================
const stockTableBody = document.getElementById('stock-table-body');

async function fetchStock() {
  const { data, error } = await supabase
    .from('stock')
    .select(`
      stock_id,
      available_quantity,
      last_updated,
      product ( product_name )
    `)
    .order('stock_id', { ascending: true });

  if (error) {
    // Fallback without join
    await fetchStockFallback();
    return;
  }

  if (!data || data.length === 0) {
    stockTableBody.innerHTML = `<tr><td colspan="5" class="empty-state"><div class="empty-icon">📊</div>No stock records yet</td></tr>`;
    return;
  }

  stockTableBody.innerHTML = data.map(s => `
    <tr>
      <td>${s.stock_id}</td>
      <td>${s.product?.product_name || '—'}</td>
      <td>
        <input type="number" class="inline-input" id="stock-qty-${s.stock_id}" value="${s.available_quantity}" min="0" />
      </td>
      <td>${s.last_updated ? new Date(s.last_updated).toLocaleDateString() : '—'}</td>
      <td>
        <button class="btn btn-success btn-sm" onclick="updateStock(${s.stock_id})">Update</button>
      </td>
    </tr>
  `).join('');
}

async function fetchStockFallback() {
  const [stockRes, productsRes] = await Promise.all([
    supabase.from('stock').select('*').order('stock_id', { ascending: true }),
    supabase.from('product').select('product_id, product_name'),
  ]);

  if (stockRes.error) {
    showToast('Error fetching stock: ' + stockRes.error.message, 'error');
    return;
  }

  const stocks   = stockRes.data || [];
  const products = Object.fromEntries((productsRes.data || []).map(p => [p.product_id, p.product_name]));

  if (stocks.length === 0) {
    stockTableBody.innerHTML = `<tr><td colspan="5" class="empty-state"><div class="empty-icon">📊</div>No stock records yet</td></tr>`;
    return;
  }

  stockTableBody.innerHTML = stocks.map(s => `
    <tr>
      <td>${s.stock_id}</td>
      <td>${products[s.product_id] || '—'}</td>
      <td>
        <input type="number" class="inline-input" id="stock-qty-${s.stock_id}" value="${s.available_quantity}" min="0" />
      </td>
      <td>${s.last_updated ? new Date(s.last_updated).toLocaleDateString() : '—'}</td>
      <td>
        <button class="btn btn-success btn-sm" onclick="updateStock(${s.stock_id})">Update</button>
      </td>
    </tr>
  `).join('');
}

async function updateStock(stockId) {
  const input = document.getElementById(`stock-qty-${stockId}`);
  const newQty = parseInt(input.value);

  if (isNaN(newQty) || newQty < 0) {
    showToast('Please enter a valid quantity', 'error');
    return;
  }

  const { error } = await supabase
    .from('stock')
    .update({
      available_quantity: newQty,
      last_updated: new Date().toISOString(),
    })
    .eq('stock_id', stockId);

  if (error) {
    showToast('Error updating stock: ' + error.message, 'error');
    return;
  }

  showToast('Stock updated successfully!', 'success');
  fetchStock();
}

// ============================================================
//  💳  PAYMENTS — CREATE + READ + DELETE
// ============================================================
const paymentForm = document.getElementById('payment-form');
const paymentsTableBody = document.getElementById('payments-table-body');

// Populate order dropdown
async function loadPaymentDropdowns() {
  const payOrderSelect = document.getElementById('pay-order');
  const { data: orders } = await supabase.from('purchase_order').select('order_id');

  payOrderSelect.innerHTML = '<option value="">Select order...</option>';
  if (orders) {
    orders.forEach(o => {
      payOrderSelect.innerHTML += `<option value="${o.order_id}">Order #${o.order_id}</option>`;
    });
  }
}

paymentForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const payment = {
    order_id:     parseInt(document.getElementById('pay-order').value),
    amount:       parseFloat(document.getElementById('pay-amount').value),
    payment_date: document.getElementById('pay-date').value,
    payment_mode: document.getElementById('pay-mode').value,
  };

  const { error } = await supabase.from('payment').insert([payment]);

  if (error) {
    showToast('Error adding payment: ' + error.message, 'error');
    return;
  }

  showToast('Payment recorded successfully!', 'success');
  paymentForm.reset();
  fetchPayments();
});

async function fetchPayments() {
  const { data, error } = await supabase
    .from('payment')
    .select('*')
    .order('payment_id', { ascending: true });

  if (error) {
    showToast('Error fetching payments: ' + error.message, 'error');
    return;
  }

  if (!data || data.length === 0) {
    paymentsTableBody.innerHTML = `<tr><td colspan="6" class="empty-state"><div class="empty-icon">💳</div>No payments yet</td></tr>`;
    return;
  }

  paymentsTableBody.innerHTML = data.map(p => `
    <tr>
      <td>${p.payment_id}</td>
      <td>${p.order_id}</td>
      <td>₹${parseFloat(p.amount).toFixed(2)}</td>
      <td>${p.payment_date}</td>
      <td><span class="badge badge-success">${p.payment_mode}</span></td>
      <td>
        <button class="btn btn-danger btn-sm" onclick="deletePayment(${p.payment_id})">Delete</button>
      </td>
    </tr>
  `).join('');
}

async function deletePayment(paymentId) {
  if (!confirm(`Are you sure you want to delete Payment #${paymentId}?`)) return;

  const { error } = await supabase
    .from('payment')
    .delete()
    .eq('payment_id', paymentId);

  if (error) {
    showToast('Error deleting payment: ' + error.message, 'error');
    return;
  }

  showToast('Payment deleted successfully!', 'success');
  fetchPayments();
}

// ============================================================
//  🚀  INITIAL LOAD
// ============================================================
document.addEventListener('DOMContentLoaded', () => {
  fetchProducts();
});
