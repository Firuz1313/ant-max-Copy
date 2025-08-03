// Создаем простое т��стовое изображение в формате base64
// Это небольшое изображение 400x300 с надписью "Главное меню"

const canvas = document.createElement("canvas");
canvas.width = 400;
canvas.height = 300;
const ctx = canvas.getContext("2d");

// Заливаем фон
ctx.fillStyle = "#1a1a1a";
ctx.fillRect(0, 0, 400, 300);

// Рисуем заголовок
ctx.fillStyle = "#ffffff";
ctx.font = "24px Arial";
ctx.textAlign = "center";
ctx.fillText("Главное меню", 200, 50);

// Рисуем псевдо-элементы интерфейса
ctx.fillStyle = "#333333";
ctx.fillRect(50, 80, 100, 60);
ctx.fillRect(170, 80, 100, 60);
ctx.fillRect(290, 80, 100, 60);

ctx.fillStyle = "#666666";
ctx.fillRect(50, 160, 100, 60);
ctx.fillRect(170, 160, 100, 60);
ctx.fillRect(290, 160, 100, 60);

// Добавляем текст на блоки
ctx.fillStyle = "#ffffff";
ctx.font = "12px Arial";
ctx.fillText("Каналы", 100, 115);
ctx.fillText("Настройки", 220, 115);
ctx.fillText("Приложения", 340, 115);
ctx.fillText("Фильмы", 100, 195);
ctx.fillText("Музыка", 220, 195);
ctx.fillText("Игры", 340, 195);

// Получаем base64
const screenshotData = canvas.toDataURL("image/png");
console.log(
  "Тестовый скриншот создан:",
  screenshotData.substring(0, 100) + "...",
);

// Этот код нужно выполнить в консоли браузера для получения base64 изображения
