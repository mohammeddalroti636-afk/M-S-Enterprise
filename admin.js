// Admin functionality for MS Enterprise

let allProducts = [];

document.addEventListener('DOMContentLoaded', () => {
    checkLoginState();
    
    // Populate categories select
    const catSelect = document.getElementById('pCategory');
    if (catSelect) {
        CATEGORIES.filter(c => c !== 'All').forEach(cat => {
            const opt = document.createElement('option');
            opt.value = cat;
            opt.textContent = cat;
            catSelect.appendChild(opt);
        });
    }
});

function attemptLogin() {
    const pass = document.getElementById('adminPassword').value;
    if (pass === ADMIN_PASSWORD) {
        sessionStorage.setItem('isAdminLoggedIn', 'true');
        showDashboard();
    } else {
        document.getElementById('loginError').style.display = 'block';
    }
}

function checkLoginState() {
    if (sessionStorage.getItem('isAdminLoggedIn') === 'true') {
        showDashboard();
    } else {
        document.getElementById('loginScreen').style.display = 'flex';
        document.getElementById('adminDashboard').style.display = 'none';
    }
}

function logout() {
    sessionStorage.removeItem('isAdminLoggedIn');
    window.location.reload();
}

async function showDashboard() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'flex';
    await loadAdminProducts();
}

async function loadAdminProducts() {
    const tbody = document.getElementById('admin-products-table');
    tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">Loading products...</td></tr>';
    
    allProducts = await fetchProducts('All');
    document.getElementById('product-count').textContent = `Total: ${allProducts.length}`;
    
    if (allProducts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align: center;">No products found. Add one!</td></tr>';
        return;
    }

    tbody.innerHTML = allProducts.map(p => `
        <tr>
            <td><img src="${p.image_url || 'images/cctv_camera.png'}" alt="${p.name}"></td>
            <td><strong>${p.name}</strong></td>
            <td>${p.category}</td>
            <td>${p.price}</td>
            <td>${p.is_featured ? '<span style="color:var(--accent)"><i class="fas fa-star"></i></span>' : '-'}</td>
            <td class="action-btns">
                <button class="btn-edit" onclick="editProduct('${p.id}')" title="Edit"><i class="fas fa-edit"></i></button>
                <button class="btn-delete" onclick="confirmDelete('${p.id}')" title="Delete"><i class="fas fa-trash"></i></button>
            </td>
        </tr>
    `).join('');
}

function openProductModal() {
    document.getElementById('modalTitle').textContent = 'Add Product';
    document.getElementById('productForm').reset();
    document.getElementById('productId').value = '';
    document.getElementById('pExistingImage').value = '';
    document.getElementById('imgPreviewContainer').style.display = 'none';
    document.getElementById('productModal').classList.add('active');
}

function closeProductModal() {
    document.getElementById('productModal').classList.remove('active');
}

function editProduct(id) {
    const p = allProducts.find(x => x.id === id);
    if (!p) return;

    document.getElementById('modalTitle').textContent = 'Edit Product';
    document.getElementById('productId').value = p.id;
    document.getElementById('pName').value = p.name;
    document.getElementById('pCategory').value = p.category;
    document.getElementById('pPrice').value = p.price || '';
    document.getElementById('pDesc').value = p.description || '';
    document.getElementById('pFeatures').value = p.features || '';
    document.getElementById('pFeatured').checked = p.is_featured || false;
    
    document.getElementById('pExistingImage').value = p.image_url || '';
    if (p.image_url) {
        document.getElementById('imgPreview').src = p.image_url;
        document.getElementById('imgPreviewContainer').style.display = 'flex';
    } else {
        document.getElementById('imgPreviewContainer').style.display = 'none';
    }

    document.getElementById('productModal').classList.add('active');
}

function previewImage(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('imgPreview').src = e.target.result;
            document.getElementById('imgPreviewContainer').style.display = 'flex';
        }
        reader.readAsDataURL(file);
    }
}

async function saveProduct(e) {
    e.preventDefault();
    const saveBtn = document.getElementById('saveBtn');
    saveBtn.textContent = 'Saving...';
    saveBtn.disabled = true;

    const id = document.getElementById('productId').value;
    const fileInput = document.getElementById('pImage');
    
    let imageUrl = document.getElementById('pExistingImage').value;

    // Handle new image upload
    if (fileInput.files.length > 0) {
        imageUrl = await uploadProductImage(fileInput.files[0]);
    } else if (!imageUrl) {
        // assign default based on category if no image
        const cat = document.getElementById('pCategory').value;
        imageUrl = DEFAULT_IMAGES[cat] || DEFAULT_IMAGES['Other'];
    }

    const productData = {
        name: document.getElementById('pName').value,
        category: document.getElementById('pCategory').value,
        price: document.getElementById('pPrice').value,
        description: document.getElementById('pDesc').value,
        features: document.getElementById('pFeatures').value,
        is_featured: document.getElementById('pFeatured').checked,
        image_url: imageUrl
    };

    if (id) {
        await updateProduct(id, productData);
    } else {
        await addProduct(productData);
    }

    saveBtn.textContent = 'Save Product';
    saveBtn.disabled = false;
    closeProductModal();
    await loadAdminProducts();
}

async function confirmDelete(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        await deleteProduct(id);
        await loadAdminProducts();
    }
}
