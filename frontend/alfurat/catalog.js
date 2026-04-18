async function fetchProducts() {
    try {
        const response = await fetch('http://localhost:3000/api/products');
        const products = await response.json();
        const productsGrid = document.querySelector('.products-grid');
        productsGrid.innerHTML = '';

        products.forEach(item => {
            // 1. Проверяем, залогинен ли админ
            const isAdmin = localStorage.getItem('token');
            if (isAdmin) {
                // alert("Админ залогинен, показываем кнопки управления для товара:", item.name);
            }

            // 2. Если админ залогинен — создаем HTML для кнопок управления
            const adminButtons = isAdmin ? `
                <div class="admin-controls" style="display:flex; gap:10px; margin-top:10px;">
                    <button class="btn edit-btn" onclick="editProduct('${item._id}')" style="background:#4CAF50; color:white; border:none; padding:8px; border-radius:5px; cursor:pointer; flex:1;">Ред.</button>
                    <button class="btn delete-btn" onclick="deleteProduct('${item._id}')" style="background:#f44336; color:white; border:none; padding:8px; border-radius:5px; cursor:pointer; flex:1;">Удалить</button>
                </div>
            ` : '';

            // 3. Формируем саму карточку товара
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

        // 2. ЗАПУСКАЕМ ФИЛЬТРАЦИЮ (теперь товары уже есть в DOM)
        const categoryBtns = document.querySelectorAll('.category-btn');
        const productItems = document.querySelectorAll('.product-item');

        categoryBtns.forEach(btn => {
            btn.onclick = function() {
                // Меняем активную кнопку
                categoryBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');

                const category = this.textContent.trim();

                productItems.forEach(item => {
                    // Ищем категорию в h3, как у тебя в верстке
                    const itemCategory = item.querySelector('h3').textContent.trim();
                    
                    if (category === 'Вся мебель' || itemCategory.includes(category)) {
                        item.style.display = 'block';
                    } else {
                        item.style.display = 'none';
                    }
                });
            };
        });

        // 3. ЗАПУСКАЕМ МОДАЛКИ (кнопки "Заказать")
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
                openModal(); // Твоя функция открытия окна
            };
        });

    } catch (error) {
        console.error("Ошибка загрузки товаров:", error);
    }
}

// Запускаем всё один раз при загрузке страницы
document.addEventListener('DOMContentLoaded', fetchProducts);





// 1. Открытие окна при клике на Alfurat.tj
document.getElementById('admin-trigger').onclick = function() {
    document.getElementById('login-modal').style.display = 'block';
};

// 2. Логика входа
document.getElementById('do-login').onclick = async function() {
    const login = document.getElementById('adm-login').value;
    const pass = document.getElementById('adm-pass').value;

    const response = await fetch(`http://localhost:3000/login/${login}/${pass}`);
    const data = await response.json();

    if (data.token) {
        localStorage.setItem('token', data.token);
        alert('Вход выполнен! Теперь можно добавлять мебель.');
        document.getElementById('login-modal').style.display = 'none';
        
        // Показываем кнопки управления (если ты их добавишь)
        location.href = 'admin.html';
    } else {
        alert('Неправильный логин или пароль');
    }
};



// 1. Функция удаления товара
async function deleteProduct(id) {
    // Спрашиваем подтверждение, чтобы не удалить случайно
    if (!confirm('Вы точно хотите удалить этот товар?')) return;

    try {
        const response = await fetch(`http://localhost:3000/api/products/${id}`, {
            method: 'DELETE',
            headers: {
                // Обязательно передаем токен, иначе сервер не разрешит удаление
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });

        if (response.ok) {
            alert('Товар успешно удален');
            location.reload(); // Перезагружаем страницу, чтобы товар исчез из списка
        } else {
            alert('Ошибка при удалении. Возможно, сессия истекла.');
        }
    } catch (error) {
        console.error("Ошибка запроса:", error);
    }
}

// 2. Функция редактирования товара (упрощенная версия через prompt)
async function editProduct(id) {
    const newName = prompt('Введите новое название товара (оставьте пустым, чтобы не менять):');
    const newPrice = prompt('Введите новую цену (оставьте пустым, чтобы не менять):');
    const newDescription = prompt('Введите новое описание товара (оставьте пустым, чтобы не менять):');

    // Собираем объект только с заполненными полями
    const updateData = {};
    if (newName && newName.trim()) updateData.name = newName.trim();
    if (newPrice && newPrice.trim()) updateData.price = Number(newPrice.trim());
    if (newDescription && newDescription.trim()) updateData.description = newDescription.trim();

    // Если ничего не заполнено — ничего не делаем
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