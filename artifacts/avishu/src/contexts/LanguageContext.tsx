import React, { createContext, useContext, useState } from "react";

export type Lang = "ru" | "en" | "kz";

const translations = {
  ru: {
    // Navigation
    home: "Главная",
    orders: "Мои Заказы",
    profile: "Профиль",
    collections: "Коллекции",
    dashboard: "Дашборд",
    products: "Товары",
    plans: "План",
    logout: "Выйти",
    back: "Назад",
    // Status labels
    status_created: "Оформлен",
    status_in_progress: "Пошив",
    status_done: "Готов",
    status_shipped: "Отправлен",
    status_received: "Получен",
    // Actions
    add: "Добавить",
    save: "Сохранить",
    cancel: "Отмена",
    delete: "Удалить",
    create: "Создать",
    edit: "Редактировать",
    // Products
    add_product: "Добавить товар",
    product_name: "Название товара",
    product_description: "Описание",
    product_price: "Цена (KZT)",
    product_collection: "Коллекция",
    product_quantity: "Количество (0 = предзаказ)",
    product_discount: "Скидка (%)",
    product_sizes: "Размеры",
    product_photos: "Фотографии",
    // Plans
    add_plan: "Добавить план",
    plan_month: "Месяц",
    plan_year: "Год",
    plan_amount: "Сумма (KZT)",
    // Orders
    order_number: "Заказ",
    no_orders: "Нет заказов",
    delete_order: "Удалить заказ?",
    // Dashboard
    revenue: "Выручка",
    active_orders: "Активные Заказы",
    total_orders: "Всего Заказов",
    orders_chart: "График заказов",
    order_total: "Общая сумма",
    // Filters
    today: "Сегодня",
    week: "Неделя",
    month: "Месяц",
    year: "Год",
    // Misc
    in_stock: "В наличии",
    in_stock_qty: "В наличии",
    preorder: "Предзаказ",
    size: "Размер",
    quantity: "Количество",
    select_size: "Выберите размер",
    order_now: "Заказать",
    preorder_now: "Предзаказ",
    sign_in: "Войти",
    email: "Email",
    password: "Пароль",
    demo_credentials: "Тестовые данные",
    lang: "Язык",
    name: "Имя",
    role: "Роль",
    no_tasks: "Нет активных задач",
    all_orders: "Все заказы",
    // Months
    months: ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"],
  },
  en: {
    home: "Home",
    orders: "My Orders",
    profile: "Profile",
    collections: "Collections",
    dashboard: "Dashboard",
    products: "Products",
    plans: "Plan",
    logout: "Logout",
    back: "Back",
    status_created: "Created",
    status_in_progress: "Sewing",
    status_done: "Ready",
    status_shipped: "Shipped",
    status_received: "Received",
    add: "Add",
    save: "Save",
    cancel: "Cancel",
    delete: "Delete",
    create: "Create",
    edit: "Edit",
    add_product: "Add Product",
    product_name: "Product Name",
    product_description: "Description",
    product_price: "Price (KZT)",
    product_collection: "Collection",
    product_quantity: "Quantity (0 = preorder)",
    product_discount: "Discount (%)",
    product_sizes: "Sizes",
    product_photos: "Photos",
    add_plan: "Add Plan",
    plan_month: "Month",
    plan_year: "Year",
    plan_amount: "Amount (KZT)",
    order_number: "Order",
    no_orders: "No orders yet",
    delete_order: "Delete this order?",
    revenue: "Revenue",
    active_orders: "Active Orders",
    total_orders: "Total Orders",
    orders_chart: "Orders Chart",
    order_total: "Total Amount",
    today: "Today",
    week: "Week",
    month: "Month",
    year: "Year",
    in_stock: "In Stock",
    in_stock_qty: "In stock",
    preorder: "Pre-order",
    size: "Size",
    quantity: "Quantity",
    select_size: "Select Size",
    order_now: "Order Now",
    preorder_now: "Pre-order",
    sign_in: "Sign In",
    email: "Email",
    password: "Password",
    demo_credentials: "Demo Credentials",
    lang: "Language",
    name: "Name",
    role: "Role",
    no_tasks: "No active tasks",
    all_orders: "All Orders",
    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
  },
  kz: {
    home: "Басты",
    orders: "Тапсырыстарым",
    profile: "Профиль",
    collections: "Коллекциялар",
    dashboard: "Бақылау тақтасы",
    products: "Тауарлар",
    plans: "Жоспар",
    logout: "Шығу",
    back: "Артқа",
    status_created: "Рәсімделді",
    status_in_progress: "Тігіс",
    status_done: "Дайын",
    status_shipped: "Жіберілді",
    status_received: "Алынды",
    add: "Қосу",
    save: "Сақтау",
    cancel: "Болдырмау",
    delete: "Жою",
    create: "Жасау",
    edit: "Өңдеу",
    add_product: "Тауар қосу",
    product_name: "Тауар атауы",
    product_description: "Сипаттама",
    product_price: "Баға (KZT)",
    product_collection: "Коллекция",
    product_quantity: "Саны (0 = алдын ала тапсырыс)",
    product_discount: "Жеңілдік (%)",
    product_sizes: "Өлшемдер",
    product_photos: "Суреттер",
    add_plan: "Жоспар қосу",
    plan_month: "Ай",
    plan_year: "Жыл",
    plan_amount: "Сома (KZT)",
    order_number: "Тапсырыс",
    no_orders: "Тапсырыстар жоқ",
    delete_order: "Тапсырысты жою?",
    revenue: "Түсім",
    active_orders: "Белсенді тапсырыстар",
    total_orders: "Барлық тапсырыстар",
    orders_chart: "Тапсырыстар кестесі",
    order_total: "Жалпы сома",
    today: "Бүгін",
    week: "Апта",
    month: "Ай",
    year: "Жыл",
    in_stock: "Қоймада бар",
    in_stock_qty: "Қоймада",
    preorder: "Алдын ала тапсырыс",
    size: "Өлшем",
    quantity: "Саны",
    select_size: "Өлшем таңдаңыз",
    order_now: "Тапсырыс беру",
    preorder_now: "Алдын ала тапсырыс",
    sign_in: "Кіру",
    email: "Электрондық пошта",
    password: "Құпиясөз",
    demo_credentials: "Демо деректер",
    lang: "Тіл",
    name: "Аты",
    role: "Рөл",
    no_tasks: "Белсенді тапсырмалар жоқ",
    all_orders: "Барлық тапсырыстар",
    months: ["Қаңтар", "Ақпан", "Наурыз", "Сәуір", "Мамыр", "Маусым", "Шілде", "Тамыз", "Қыркүйек", "Қазан", "Қараша", "Желтоқсан"],
  },
} as const;

type Translations = typeof translations.ru;
type TranslationKey = keyof Translations;

interface LanguageContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: "ru",
  setLang: () => {},
  t: (key) => translations.ru[key] as string,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => {
    return (localStorage.getItem("avishu_lang") as Lang) || "ru";
  });

  const handleSetLang = (l: Lang) => {
    setLang(l);
    localStorage.setItem("avishu_lang", l);
  };

  const t = (key: TranslationKey): string => {
    const val = (translations[lang] as any)[key];
    if (Array.isArray(val)) return val.join(", ");
    return val as string;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang: handleSetLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function getMonthName(monthIdx: number, lang: Lang): string {
  return translations[lang].months[monthIdx - 1] || String(monthIdx);
}
