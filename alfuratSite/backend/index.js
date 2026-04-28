require('dotenv').config({ path: __dirname + '/.env' });
const express = require('express');
const cors = require('cors');
const app = express();
const { MongoClient, ServerApiVersion } = require('mongodb');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');


app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));




const storage = multer.diskStorage({
    destination: './uploads/', // Папка для сохранения изображений
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Уникальное имя файла
    }
})
 const upload = multer({ storage: storage });


const dburl = process.env.MONGO_URL;
const mongoose = require('mongoose');
mongoose.connect(dburl)
    .then(() => console.log('Подключено к MongoDB!'))
    .catch(err => console.log('Ошибка:', err));

const Product = mongoose.model('alfuratProduct', new mongoose.Schema({
    name: String,
    price: Number,
    category: String,
    image: String,
    description: String
}), 'alfuratProduct'); // 'alfuratProduct' — название коллекции в Atlas

const auth = (req, res, next) => {
    try {
        // Берем токен из заголовка запроса
        const token = req.header('Authorization').replace('Bearer ', '');
        
        // Проверяем его нашей секретной фразой
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        // Добавляем ID юзера в запрос, чтобы другие роуты его видели
        req.userId = decoded.id;
        
        next(); // Всё супер, пропускаем дальше!
    } catch (e) {
        res.status(401).send("Ошибка: Сначала авторизуйся!");
    }
};


const admin = mongoose.model('alfuratAdmin', new mongoose.Schema({
    login: { type: String, required: true, unique: true },
    password: { type: String, required: true}
}), 'alfuratAdmin');


app.get('/login/:userLogin/:userPassword', async (req, res) => {
    try {
        const { userLogin, userPassword } = req.params; 
        
        const user = await admin.findOne({ login: userLogin });

        if (!user) {
            return res.status(404).send("Админ не найден");
        }

        if (userPassword !== user.password) {
            return res.status(401).send("Неверный пароль");
        }

        const token = jwt.sign(
            { id: user._id }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' }
        );

        res.json({ 
            message: "Вход выполнен!", 
            token: token 
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).send("Ошибка сервера: " + error.message);
    }
});


app.post('/api/products/add', auth, async (req, res) => {
    try {
        const { name, price, category, image, description } = req.body;
        
        const newProduct = new Product({ name, price, category, image, description });
        await newProduct.save();

        res.json({ message: "Товар успешно добавлен!", product: newProduct });
    } catch (error) {
        res.status(500).send("Ошибка при сохранении: " + error.message);
    }
});



app.get('/api/products', async (req, res) => {
    try {
        const products = await Product.find(); // Ищем товары в базе
        res.json(products); // Отправляем их фронтенду
    } catch (err) {
        res.status(500).json({ message: "Ошибка базы данных" });
    }
});


// УДАЛЕНИЕ ТОВАРА
app.delete('/api/products/:id', auth, async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: "Товар удален" });
    } catch (error) {
        res.status(500).send("Ошибка при удалении");
    }
});

// ОБНОВЛЕНИЕ ТОВАРА (Update)
app.put('/api/products/:id', auth, async (req, res) => {
    console.log('PUT запрос на обновление товара:', req.params.id);
    console.log('Тело запроса:', req.body);
    try {
        const updatedProduct = await Product.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true } // Чтобы вернул уже обновленный объект
        );
        if (!updatedProduct) {
            console.log('Товар не найден');
            return res.status(404).send("Товар не найден");
        }
        console.log('Обновленный товар:', updatedProduct);
        res.json(updatedProduct);
    } catch (error) {
        console.error("Ошибка при обновлении:", error);
        res.status(500).send("Ошибка при обновлении");
    }
});


app.post('/api/upload', auth, upload.single('image'), (req, res) => {
    if (!req.file) return res.status(400).send("Файл не выбран");

    const imageUrl = `https://alfurat.onrender.com/uploads/${req.file.filename}`;
    res.json({ imageUrl });
});



app.listen(process.env.PORT, () => {
    console.log(`Сервер запущен на порту ${process.env.PORT}`);
});
