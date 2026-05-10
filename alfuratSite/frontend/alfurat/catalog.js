async function fetchProducts() {
    try {
        const response = await fetch('http://localhost:3000/api/products');
        const products = await response.json();
        const productsGrid = document.querySelector('.products-grid');
        productsGrid.innerHTML = '';

        products.forEach(item => {
            const isAdmin = localStorage.getItem('token');
            if (isAdmin) {
               // alert("Админ залогинен, показываем кнопки управления для товара:", item.name);
            }

            const adminButtons = isAdmin ? `
                <div class="admin-controls" style="display:flex; gap:10px; margin-top:10px;">
                    <button class="btn edit-btn" onclick="editProduct('${item._id}')" style="background:#4CAF50; color:white; border:none; padding:8px; border-radius:5px; cursor:pointer; flex:1;">Ред.</button>
                    <button class="btn delete-btn" onclick="deleteProduct('${item._id}')" style="background:#f44336; color:white; border:none; padding:8px; border-radius:5px; cursor:pointer; flex:1;">Удалить</button>
                </div>
            ` : '';

            const productHTML = `
                <div class="product-item">
                    <img class="product-img" src="${item.image}" alt="${item.category}">
                    <h2 class="product-name">${item.name}</h2>
                    <h3 class="id-items">${item.category}</h3>
                    <p class="price" style="margin: -5px;">${item.price.toLocaleString()} Р</p>
                    <p class="description">${item.description || ''}</p>
                    <button class="btn choose-btn">Заказать</button>
                    
                    ${adminButtons}
                </div>
            `;
            
            productsGrid.innerHTML += productHTML;
        });

        const categoryBtns = document.querySelectorAll('.category-btn');
        const productItems = document.querySelectorAll('.product-item');

        categoryBtns.forEach(btn => {
            btn.onclick = function() {
                categoryBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                const category = this.textContent.trim();

                productItems.forEach(item => {
                    const itemCategory = item.querySelector('h3').textContent.trim();
                    
                    if (category === 'Вся мебель' || itemCategory.includes(category)) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            };
        });

        document.querySelectorAll('.choose-btn').forEach(btn => {
            btn.onclick = function() {
                const productItem = this.closest('.product-item');
                const img = productItem.querySelector('.product-img');
                const modalImg = document.getElementById('modalProductImg');
                const hiddenInput = document.getElementById('productImgUrl');

                if (img && modalImg) {
                    modalImg.src = img.src;
                    modalImg.style.display = 'block';
                    if (hiddenInput) hiddenInput.value = img.src;
                }
                openModal(); 
            };
        });

    } catch (error) {
        console.error("Ошибка загрузки товаров:", error);
    }
}

document.addEventListener('DOMContentLoaded', fetchProducts);

if (localStorage.getItem('token')) {
    console.log("Админ уже залогинен, показываем кнопки управления.");
    document.querySelector('#admin-cabinet').style.display = 'block'; 
} else {
    document.querySelector('#admin-cabinet').style.display = 'none';
}



document.getElementById('admin-trigger').onclick = function() {
    document.getElementById('login-modal').style.display = 'block';
};

document.getElementById('do-login').onclick = async function() {
    const login = document.getElementById('adm-login').value;
    const pass = document.getElementById('adm-pass').value;

    const response = await fetch(`http://localhost:3000/login/${login}/${pass}`);
    const data = await response.json();

    if (data.token) {
        localStorage.setItem('token', data.token);
        alert('Вход выполнен! Теперь можно добавлять мебель.');
        document.getElementById('login-modal').style.display = 'none';
        
        location.href = 'admin.html';
    } else {
        alert('Неправильный логин или пароль');
    }
};



async function deleteProduct(id) {
    if (!confirm('Вы точно хотите удалить этот товар?')) return;

    try {
        const response = await fetch(`http://localhost:3000/api/products/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        if (response.ok) {
            alert('Товар успешно удален');
            location.reload(); 
        } else {
            alert('Ошибка при удалении. Возможно, сессия истекла.');
        }
    } catch (error) {
        console.error("Ошибка запроса:", error);
    }
}



async function editProduct(id) {
    const newName = prompt('Введите новое название товара (оставьте пустым, чтобы не менять):');
    const newPrice = prompt('Введите новую цену (оставьте пустым, чтобы не менять):');
    const newDescription = prompt('Введите новое описание товара (оставьте пустым, чтобы не менять):');

    const updateData = {};
    if (newName && newName.trim()) updateData.name = newName.trim();
    if (newPrice && newPrice.trim()) updateData.price = Number(newPrice.trim());
    if (newDescription && newDescription.trim()) updateData.description = newDescription.trim();

    if (Object.keys(updateData).length === 0) {
        alert('Ничего не изменено.');
        return;
    }

    console.log('Отправка PUT запроса для товара ID:', id);
    console.log('Данные для обновления:', updateData);
    console.log('Токен:', localStorage.getItem('token'));

    try {
        const response = await fetch(`http://localhost:3000/api/products/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            },
            body: JSON.stringify(updateData)
        });

        console.log('Ответ сервера:', response.status, response.statusText);
        const result = await response.json();
        console.log('Результат:', result);

        if (response.ok) {
            alert('Данные обновлены!');
            location.reload();
        } else {
            alert('Не удалось обновить товар: ' + (result.message || 'Ошибка'));
        }
    } catch (error) {
        console.error("Ошибка запроса:", error);
        alert('Ошибка сети: ' + error.message);
    }
}



async function sendOrder(event) {
    event = event || window.event;
    if (event && event.preventDefault) event.preventDefault(); // Останавливаем перезагрузку страницы!

    const name = document.getElementById('customerName').value;
    const phone = document.getElementById('customerPhone').value;
    const email = document.getElementById('customerEmail').value;
    const message = document.getElementById('customerMessage').value;
    
    const image = document.getElementById('modalProductImg').src;

    console.log('sendOrder called', { name, phone, email, message, image });

    if (!name || !phone) {
        alert("Пожалуйста, введите имя и номер телефона!");
        return;
    }

    try {
        const response = await fetch('http://localhost:3000/api/orders', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                name: name, 
                phone: phone, 
                image: image, 
                email: email, 
                message: message 
            })
        });

        if (response.ok) {
            alert('Заказ успешно отправлен в базу!');
            document.getElementById('customerName').value = '';
            document.getElementById('customerPhone').value = '';
            document.getElementById('customerEmail').value = '';
            document.getElementById('customerMessage').value = '';
            openModal(); 
        } else {
            const errorText = await response.text();
            alert('Ошибка сервера: ' + errorText);
        }
    } catch (err) {
        console.error("Ошибка сети или сервера:", err);
        alert('Не удалось связаться с сервером. Проверьте, запущен ли backend.');
    }
}