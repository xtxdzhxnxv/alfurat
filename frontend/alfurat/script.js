document.addEventListener('DOMContentLoaded', function () {
    // Модальное окно

    document.addEventListener('DOMContentLoaded', function () {
        const callbackForm = document.getElementById('callbackForm');
        const callbackResult = document.getElementById('callbackResult');
        const callbackSubmit = document.getElementById('callbackSubmit');
        const btnText = callbackSubmit.querySelector('.btn-text');
        const btnLoading = callbackSubmit.querySelector('.btn-loading');

        // Маска для телефона
        const phoneInput = document.getElementById('callbackPhone');
        phoneInput.addEventListener('input', function (e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 0) {
                value = '+7 (' + value;
                if (value.length > 7) value = value.slice(0, 7) + ') ' + value.slice(7);
                if (value.length > 12) value = value.slice(0, 12) + '-' + value.slice(12);
                if (value.length > 15) value = value.slice(0, 15) + '-' + value.slice(15);
                if (value.length > 18) value = value.slice(0, 18);
            }
            e.target.value = value;
        });

        // Отправка формы
        callbackForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const formData = {
                name: document.getElementById('callbackName').value.trim(),
                phone: document.getElementById('callbackPhone').value.trim(),
                message: document.getElementById('callbackMessage').value.trim(),
                date: new Date().toLocaleString('ru-RU')
            };

            // Валидация
            if (!formData.name) {
                showResult('Пожалуйста, введите ваше имя', 'error');
                return;
            }

            if (!formData.phone || formData.phone.replace(/\D/g, '').length < 11) {
                showResult('Пожалуйста, введите корректный номер телефона', 'error');
                return;
            }

            // Показываем загрузку
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline';
            callbackSubmit.disabled = true;
            callbackResult.style.display = 'none';

            try {
                // Здесь будет отправка на сервер
                await sendCallbackRequest(formData);

                // Успешная отправка
                showResult('Спасибо! Ваша заявка принята. Мы перезвоним вам в течение 15 минут.', 'success');
                callbackForm.reset();

            } catch (error) {
                console.error('Ошибка отправки:', error);
                showResult('Произошла ошибка при отправке. Пожалуйста, попробуйте ещё раз или позвоните нам напрямую.', 'error');
            } finally {
                // Возвращаем кнопку в исходное состояние
                btnText.style.display = 'inline';
                btnLoading.style.display = 'none';
                callbackSubmit.disabled = false;
            }
        });

        // Функция показа результата
        function showResult(message, type) {
            callbackResult.textContent = message;
            callbackResult.className = 'callback-result ' + type;
            callbackResult.style.display = 'block';
        }

        // Функция отправки запроса (ЗАМЕНИТЕ НА СВОЙ СЕРВЕР)
        async function sendCallbackRequest(data) {
            // Вариант 1: Email через Formspree (бесплатно)
            // 1. Зарегистрируйтесь на formspree.io
            // 2. Получите ваш form-id
            // 3. Раскомментируйте код ниже:

            const response = await fetch('https://formspree.io/f/mwpqdqdk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: data.name,
                    phone: data.phone,
                    message: data.message || 'Нет сообщения',
                    date: data.date,
                    subject: 'Новая заявка на звонок'
                })
            });

            if (!response.ok) throw new Error('Ошибка сервера');


            // Для демонстрации используем задержку
            await new Promise(resolve => setTimeout(resolve, 2000));

            // В реальном проекте удалите строку выше и используйте один из вариантов выше
            console.log('Данные для отправки:', data);
            alert('В реальном проекте здесь будет отправка на ваш email/SMS');
        }
    });

    // Плавная прокрутка
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });






    // Анимация при прокрутке
    const animateOnScroll = function () {
        const elements = document.querySelectorAll('.advantage-item, .product-item, .about-image, .form-image');

        elements.forEach(element => {
            const elementPosition = element.getBoundingClientRect().top;
            const screenPosition = window.innerHeight / 1.3;

            if (elementPosition < screenPosition) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }
        });
    };

    // Устанавливаем начальные стили для анимации
    const animatedElements = document.querySelectorAll('.advantage-item, .product-item, .about-image, .form-image');
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    });

    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Запускаем при загрузке страницы
});

function shownav() {
    const nav = document.querySelector('nav');
    nav.style.display = (nav.style.display === 'block') ? 'none' : 'block';
}

function openModal() {
    const modal = document.querySelector('.callback-form-container');
    modal.style.display = (modal.style.display === 'block') ? 'none' : 'block';
    const hiddenModal = document.querySelector('.hiddenModal');
    hiddenModal.style.display = (hiddenModal.style.display === 'block') ? 'none' : 'block';
    document.body.style.overflow = (document.body.style.overflow === 'hidden') ? 'auto' : 'hidden';

}


