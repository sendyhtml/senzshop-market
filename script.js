  (function() {
    // ----- DATA PRODUK (dapat ditambah / dikurangi oleh pemilik via sini) -----
    const products = [
      { id: 1, name: "SC AUTO ORDER V2", price: 20000, stock: 99 },
      { id: 2, name: "SC AUTO ORDER V1", price: 11000, stock: 99 },
      { id: 3, name: "SC HOST INFINITY", price: 10000, stock: 99 },
      { id: 4, name: "SC A.O NOKOS", price: 10000, stock: 99 },
    { id: 5, name: "SC SENDYxCPANEL", price: 10000, stock: 99 },
      { id: 6, name: "PANEL UNLI", price: 4000, stock: 99 },
      { id: 7, name: "RESELLER PANEL", price: 7000, stock: 99 },
      { id: 8, name: "SC SENZHOST MD", price: 10000, stock: 99 }
    ];

    // KODE PROMO statis (bisa diedit oleh pemilik)
    const validPromos = { "SENZ2": 25 }; // diskon persen

    // STATE GLOBAL - Menggunakan localStorage agar data tetap ada
    let cartItems = [];
    let orders = [];
    let currentUser = { name: "Senz User", username: "senz", pass: "123", isLoggedIn: false };
    let selectedProduct = null; // untuk detail
    let confirmProduct = null; // saat beli sekarang

    // Load data dari localStorage
    function loadFromStorage() {
      try {
        // Load cart items
        const savedCart = localStorage.getItem('senzshop_cart');
        if (savedCart) {
          cartItems = JSON.parse(savedCart);
        }
        
        // Load orders
        const savedOrders = localStorage.getItem('senzshop_orders');
        if (savedOrders) {
          orders = JSON.parse(savedOrders);
        }
        
        // Load user session
        const savedUser = localStorage.getItem('senzshop_user');
        if (savedUser) {
          const userData = JSON.parse(savedUser);
          currentUser = { ...currentUser, ...userData };
        }
      } catch (e) {
        console.log('Error loading from storage', e);
      }
    }
    
    // Simpan data ke localStorage
    function saveToStorage() {
      localStorage.setItem('senzshop_cart', JSON.stringify(cartItems));
      localStorage.setItem('senzshop_orders', JSON.stringify(orders));
      localStorage.setItem('senzshop_user', JSON.stringify({
        name: currentUser.name,
        isLoggedIn: currentUser.isLoggedIn
      }));
    }

    // elemen
    const loginPage = document.getElementById('loginPage');
    const dashboardPage = document.getElementById('dashboardPage');
    const detailPage = document.getElementById('detailPage');
    const confirmPage = document.getElementById('confirmPage');
    const cartPage = document.getElementById('cartPage');
    const orderPage = document.getElementById('orderPage');
    const profilePage = document.getElementById('profilePage');
    const bottomNav = document.getElementById('bottomNav');
    const productListDiv = document.getElementById('productList');
    const detailContainer = document.getElementById('detailContainer');
    const confirmContainer = document.getElementById('confirmContainer');
    const cartList = document.getElementById('cartList');
    const orderList = document.getElementById('orderList');
    const profileNameInput = document.getElementById('profileNameInput');
    const displayNameSpan = document.getElementById('displayName');

    // login/register toggle
    const loginFormDiv = document.getElementById('loginForm');
    const registerFormDiv = document.getElementById('registerForm');
    document.getElementById('showLoginTab').addEventListener('click', ()=>{
      loginFormDiv.style.display = 'block';
      registerFormDiv.style.display = 'none';
    });
    document.getElementById('showRegisterTab').addEventListener('click', ()=>{
      loginFormDiv.style.display = 'none';
      registerFormDiv.style.display = 'block';
    });

    // login action
    document.getElementById('loginBtn').addEventListener('click', ()=>{
      let user = document.getElementById('loginUser').value.trim() || "senz";
      let pass = document.getElementById('loginPass').value;
      // simple login, terima semua
      currentUser.name = user;
      currentUser.isLoggedIn = true;
      saveToStorage();
      goToPage('dashboard');
      updateUIafterLogin();
    });
    
    document.getElementById('registerBtn').addEventListener('click', ()=>{
      let name = document.getElementById('regName').value.trim() || "Pengguna Baru";
      currentUser.name = name;
      currentUser.isLoggedIn = true;
      saveToStorage();
      goToPage('dashboard');
      updateUIafterLogin();
    });

    // logout
    document.getElementById('logoutBtn').addEventListener('click', ()=>{
      currentUser.isLoggedIn = false;
      saveToStorage();
      loginPage.classList.add('active-page');
      hideAllPages();
      bottomNav.style.display = 'none';
      loginFormDiv.style.display = 'block';
      registerFormDiv.style.display = 'none';
    });

    // update tampilan setelah login
    function updateUIafterLogin() {
      displayNameSpan.innerText = currentUser.name;
      profileNameInput.value = currentUser.name;
      renderProducts();
      renderCart();
      renderOrders();
    }

    // render produk di dashboard
    function renderProducts() {
      let html = '';
      products.forEach(p => {
        html += `<div class="product-card" data-id="${p.id}" onclick="window.openDetail(${p.id})">
          <img src="https://files.catbox.moe/w0dzhg.jpg" class="product-thumb">
          <div class="product-name">${p.name}</div>
          <div class="product-price">Rp${p.price.toLocaleString()}</div>
        </div>`;
      });
      productListDiv.innerHTML = html;
    }
    
    window.openDetail = (id) => {
      selectedProduct = products.find(p => p.id === id);
      if (!selectedProduct) return;
      showDetailPage();
    };

    function showDetailPage() {
      if (!selectedProduct) return;
      let p = selectedProduct;
      let detailHtml = `
        <img src="https://files.catbox.moe/w0dzhg.jpg" class="detail-image">
        <div class="detail-title">${p.name}</div>
        <div class="price-big">Rp${p.price.toLocaleString()}</div>
        <div class="stock-picker">
          <span>Stok tersedia: <strong>${p.stock}</strong></span>
          <span><i class="fas fa-box"></i> pilih variasi</span>
        </div>
        <div class="action-buttons">
          <button class="btn-cart" id="addToCartDetail"><i class="fas fa-cart-plus"></i> Keranjang</button>
          <button class="btn-buy" id="buyNowDetail">Beli Sekarang</button>
        </div>
      `;
      detailContainer.innerHTML = detailHtml;
      goToPage('detail');

      document.getElementById('addToCartDetail').addEventListener('click', ()=>{
        cartItems.push({...p});
        saveToStorage();
        alert('Ditambahkan ke keranjang!');
        renderCart();
      });
      
      document.getElementById('buyNowDetail').addEventListener('click', ()=>{
        confirmProduct = {...p};
        showConfirmPage(confirmProduct);
      });
    }

    // halaman konfirmasi
    function showConfirmPage(prod) {
      let diskon = 0;
      let promoCode = '';
      let hargaAsli = prod.price;
      let admin = 500;
      let total = hargaAsli + admin;

      let html = `
        <div class="confirm-box">
          <div class="mini-product">
            <img src="https://files.catbox.moe/w0dzhg.jpg" class="mini-thumb">
            <div><strong>${prod.name}</strong><br>Rp${prod.price.toLocaleString()}</div>
          </div>
          <div style="margin:16px 0">Diskon: <span id="diskonText">Tidak Ada diskon</span></div>
          <input type="text" class="promo-input" id="promoInput" placeholder="Masukan kode promo" value="">
          <button class="btn-outline" id="applyPromo" style="margin:10px 0 20px; width:100%;">Pakai Promo</button>
          <div class="row-harga"><span>Harga asli</span> <span>Rp${hargaAsli.toLocaleString()}</span></div>
          <div class="row-harga"><span>Admin</span> <span>Rp500</span></div>
          <div class="row-harga total-harga"><span>Total Harga</span> <span id="totalHargaSpan">Rp${(hargaAsli+admin).toLocaleString()}</span></div>
          <button class="btn-primary" id="confirmBuyNow" style="margin-top:20px;">Beli Sekarang</button>
        </div>
      `;
      confirmContainer.innerHTML = html;
      goToPage('confirm');

      document.getElementById('applyPromo').addEventListener('click', ()=>{
        let code = document.getElementById('promoInput').value.trim().toUpperCase();
        let discount = validPromos[code] || 0;
        let diskonRp = Math.floor(hargaAsli * discount / 100);
        let newTotal = hargaAsli - diskonRp + admin;
        document.getElementById('diskonText').innerText = discount ? `${discount}% (Rp${diskonRp.toLocaleString()})` : 'Tidak Ada diskon';
        document.getElementById('totalHargaSpan').innerText = 'Rp' + newTotal.toLocaleString();
        // simpan ke confirmProduct sementara untuk total
        confirmProduct.finalTotal = newTotal;
        confirmProduct.diskon = discount;
      });

      document.getElementById('confirmBuyNow').addEventListener('click', ()=>{
        let finalHarga = confirmProduct.finalTotal || (hargaAsli+admin);
        let now = new Date();
        let waktu = now.toLocaleString('id-ID', { hour:'2-digit', minute:'2-digit', day:'2-digit', month:'2-digit', year:'numeric' }).replace(',','');
        let namaUser = currentUser.name;
        let namaProduk = confirmProduct.name;
        let pesan = `📜 DATA PEMBELI BARU\n━━━━━━━━━━━━━━━━━━━━━⨳\n🪪 𝗜𝗗𝗘𝗡𝗧𝗜𝗧𝗔𝗦 𝗣𝗘𝗠𝗕𝗘𝗟𝗜\n├⌑ 👤 𝗡𝗮𝗺𝗮 : ${namaUser}\n├⌑ 🛒 𝗣𝗿𝗼𝗱𝘂𝗸 : ${namaProduk}\n├⌑ 💰 𝗛𝗮𝗿𝗴𝗮 : Rp${finalHarga.toLocaleString()}\n╰⌑ ⏰ 𝗪𝗮𝗸𝘁𝘂 : ${waktu} \n\n📨 𝗧𝗲𝗿𝗶𝗺𝗮𝗸𝗮𝘀𝗶𝗵 𝗦𝘂𝗱𝗮𝗵 𝗕𝗲𝗹𝗮𝗻𝗷𝗮 𝗗𝗶 :\n➥ SenzShop Order`;

        // tambahkan ke riwayat pesanan
        orders.push({ ...confirmProduct, tanggal: waktu, total: finalHarga });
        saveToStorage();
        renderOrders();

        // redirect ke telegram dengan encode
        let url = `https://t.me/sendyhosting?text=${encodeURIComponent(pesan)}`;
        window.open(url, '_blank');
        alert('Pesanan diteruskan ke Telegram');
        // kembali ke dashboard
        goToPage('dashboard');
      });
    }

    // render keranjang dengan tombol Beli Sekarang
    function renderCart() {
      if (cartItems.length === 0) {
        cartList.innerHTML = '<div style="text-align:center; margin-top:60px;">🛒 Keranjang kosong</div>';
        return;
      }
      let html = '';
      cartItems.forEach((item, idx) => {
        html += `
          <div class="cart-item" data-cart-index="${idx}">
            <img src="https://files.catbox.moe/w0dzhg.jpg" style="width:70px; height:70px; border-radius:20px;">
            <div class="cart-item-details">
              <div><strong>${item.name}</strong></div>
              <div class="product-price">Rp${item.price.toLocaleString()}</div>
            </div>
            <div class="cart-item-actions">
              <button class="btn-small-buy buy-from-cart" data-product-id="${item.id}" data-cart-index="${idx}">Beli Sekarang</button>
            </div>
          </div>
        `;
      });
      cartList.innerHTML = html;
      
      // Tambahkan event listener untuk semua tombol "Beli Sekarang" di keranjang
      document.querySelectorAll('.buy-from-cart').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.stopPropagation();
          const productId = parseInt(btn.dataset.productId);
          const cartIndex = parseInt(btn.dataset.cartIndex);
          
          // Ambil produk dari keranjang
          const cartItem = cartItems[cartIndex];
          if (cartItem) {
            confirmProduct = {...cartItem};
            showConfirmPage(confirmProduct);
          }
        });
      });
    }

    // render pesanan
    function renderOrders() {
      if (orders.length === 0) {
        orderList.innerHTML = '<div style="text-align:center; margin-top:60px;">Belum ada pesanan</div>';
        return;
      }
      let html = '';
      orders.slice().reverse().forEach(o => {
        html += `<div style="background:white; border-radius:26px; padding:14px; margin-bottom:12px; display:flex; gap:14px;">
          <img src="https://files.catbox.moe/w0dzhg.jpg" style="width:60px; height:60px; border-radius:18px;">
          <div><strong>${o.name}</strong><br>Rp${o.total ? o.total.toLocaleString() : o.price.toLocaleString()} <br><span class="text-small">${o.tanggal || ''}</span></div>
        </div>`;
      });
      orderList.innerHTML = html;
    }

    // navigasi antar halaman
    function goToPage(page) {
      hideAllPages();
      if (page === 'dashboard') dashboardPage.classList.add('active-page');
      else if (page === 'detail') detailPage.classList.add('active-page');
      else if (page === 'confirm') confirmPage.classList.add('active-page');
      else if (page === 'cart') { cartPage.classList.add('active-page'); renderCart(); }
      else if (page === 'order') { orderPage.classList.add('active-page'); renderOrders(); }
      else if (page === 'profile') profilePage.classList.add('active-page');
      bottomNav.style.display = 'flex';
    }

    function hideAllPages() {
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active-page'));
      loginPage.classList.remove('active-page');
    }

    // bottom nav listener
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        let page = item.dataset.page;
        if (page === 'dashboard') goToPage('dashboard');
        else if (page === 'cart') goToPage('cart');
        else if (page === 'order') goToPage('order');
        else if (page === 'profile') goToPage('profile');
        document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
        item.classList.add('active');
      });
    });

    // back buttons
    document.getElementById('backFromDetail').addEventListener('click', ()=>goToPage('dashboard'));
    document.getElementById('backFromConfirm').addEventListener('click', ()=>goToPage('detail'));
    document.getElementById('backFromCart').addEventListener('click', ()=>goToPage('dashboard'));
    document.getElementById('backFromOrder').addEventListener('click', ()=>goToPage('dashboard'));
    document.getElementById('backFromProfile').addEventListener('click', ()=>goToPage('dashboard'));

    // update profile
    document.getElementById('updateProfileBtn').addEventListener('click', ()=>{
      currentUser.name = profileNameInput.value;
      displayNameSpan.innerText = currentUser.name;
      saveToStorage();
      alert('Profil tersimpan');
    });

    // Inisialisasi aplikasi
    function initApp() {
      loadFromStorage();
      
      // Cek apakah user sudah login
      if (currentUser.isLoggedIn) {
        // Langsung ke dashboard tanpa perlu login ulang
        goToPage('dashboard');
        updateUIafterLogin();
      } else {
        // Tampilkan halaman login
        loginPage.classList.add('active-page');
        bottomNav.style.display = 'none';
      }
    }
    
    // Jalankan inisialisasi
    initApp();
    
    window.goToPage = goToPage;

  })();
