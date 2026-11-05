<?php
declare(strict_types=1);

// 1. Конфігурація підключення
$host     = '127.0.0.1';
$port     = '3306';
$dbname   = 'task_manager';
$username = 'root';
$password = ''; // У XAMPP за замовчуванням пароль порожній
$charset  = 'utf8mb4';

$dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset={$charset}";

$options = [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
];

try {
    // 2. Створення об'єкта PDO
    $pdo = new PDO($dsn, $username, $password, $options);
    echo "<h2 style='color: green;'> З'єднання з базою даних успішно встановлено!</h2>";

    // 3. Перевірка таблиць (SHOW TABLES)
    $stmtTables = $pdo->query("SHOW TABLES");
    $tables = $stmtTables->fetchAll(PDO::FETCH_COLUMN);

    echo "<h3>Список таблиць у БД task_manager:</h3><ul>";
    foreach ($tables as $table) {
        echo "<li>" . htmlspecialchars($table) . "</li>";
    }
    echo "</ul>";

    // 4. Зчитування тестових записів із таблиці tasks (SELECT)
    $stmtTasks = $pdo->query("SELECT * FROM tasks");
    $tasks = $stmtTasks->fetchAll();

    echo "<h3>Тестові записи з таблиці tasks:</h3>";
    echo "<pre>";
    print_r($tasks);
    echo "</pre>";

} catch (PDOException $e) {
    // 5. Обробка помилок з'єднання
    echo "<h2 style='color: red;'>Помилка підключення до БД:</h2>";
    echo "<p>" . htmlspecialchars($e->getMessage()) . "</p>";
}