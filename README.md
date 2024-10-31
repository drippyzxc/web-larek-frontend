# Проектная работа "Веб-ларек"

Веб-магазин для разработчиков, предлагающий каталог товаров с возможностью добавления товаров в корзину и оформления заказа.

## Технологии:

- HTML, SCSS, TS, Webpack

## Структура проекта:

- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

## Важные файлы:

- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/scss/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск

Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```

## Сборка

```
npm run build
```

или

```
yarn build
```

## Данные и типы данных, используемые в приложении

Основное состояние приложения:

```
interface IAppStatus {
	catalog: ICard[];
	basket: ICard[];
	preview: string | null;
	delivery: IOrdersDelivery | null;
	contact: IOrdersContacts | null;
	order: IOrder | null;
}
```

Главная страница:

```
interface IPage {
    counter: number;
    catalog: HTMLElement[];
    locked: boolean;
}
```

Данные товара:

```
interface ICard {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
	count?: string;
	buttonText?: string;
}
```

Способ оплаты и адрес доставки:

```
interface IOrdersDelivery {
	payment: string;
	address: string;
}
```

Контактные данные:

```
interface IOrdersContacts {
	email: string;
	phone: string;
}
```

Заказ:

```
interface IOrder extends IOrdersDelivery, IOrdersContacts {
	total: number | null;
	items: string[];
}
```

Подтверждение успешного заказа:

```
interface IOrderSuccess {
	id: string;
	total: number | null;
}
```

Сообщение об успешном заказе:

```

interface ISuccess {
image: string;
title: string;
description: string;
total: number | null;
}

```

Данные корзины:

```

interface IBasket {
items: HTMLElement[];
total: number;
}

```

Тип ошибок формы:

```

type FormErrors = Partial<Record<keyof IOrder, string>>;

```

События:

```
interface IActions {
	onClick: (event: MouseEvent) => void;
}
```

## Архитектура приложения

<img src="https://github.com/drippyzxc/web-larek-oop-image/blob/main/3214131413141.drawio.png" />

### Базовый код

#### Класс Api

Класс для обработки базовых HTTP-запросов (`GET`, `POST`, `PUT`, `DELETE`) и обработки ответов. Методы:

- `get` и `post` - для выполнения запросов на сервер.
- `handleRespons` - для обработки ответа от сервера, его парсинга и обработки ошибок.

Конструктор класса:

- `constructor(baseUrl: string, options: RequestInit = {})`- принимает базовый URL и глобальные настройки для всех запросов (опционально).

Свойства класса:

- `baseUrl: string` — базовый URL для отправки запросов.
- `options: RequestInit` — опции запросов, включая заголовки.

Методы:

- `get(uri: string)` - выполняет GET-запрос и возвращает ответ от сервера.
- `post(uri: string, data: object, method: ApiPostMethods = 'POST')` - отправляет POST-запрос с JSON-данными на указанный endpoint. Метод запроса можно изменить третьим параметром.
- `handleResponse(response: Response)` - обрабатывает ответ сервера, возвращая его в формате json, или ошибку, если ответ пуст.

#### Класс EventEmitter

Реализует шаблон «Наблюдатель», позволяя подписываться на события и рассылать уведомления. Методы `on`, `off`, `emit` служат для добавления и удаления обработчиков и уведомлений. Дополнительно есть `onAll` и `offAll` для работы со всеми событиями.

Конструктор класса:

- `constructor() { this._events = new Map<EventName, Set<Subscriber>>() }` - инициализирует `_events` для хранения обработчиков событий.

Методы класса:

- `on<T extends object>(eventName: EventName, callback: (event: T) => void)` - добавляет обработчик для события.
- `off(eventName: EventName, callback: Subscriber)` - удаляет обработчик.
- `emit<T extends object>(eventName: string, data?: T)` - вызывает событие с данными.
- `onAll(callback: (event: EmitterEvent) => void)` - добавляет обработчик для всех событий.
- `trigger<T extends object>(eventName: string, context?: Partial<T>)` - создает событие при вызове.

#### Класс Model

Базовый класс для создания моделей данных приложения, взаимодействует с `EventEmitter`, принимая в конструктор начальные данные и объект событий.

Конструктор класса:
`constructor(data: Partial<T>, protected events: IEvents)` - принимает начальные данные модели и объект событий.

Методы класса:
`notifyChange(event: string, payload?: object)` - оповещает подписчиков об изменении модели, передавая имя события и данные.

#### Класс UserInterfaceComponent<T>

Базовый класс, который наследуют компоненты интерфейса. Содержит методы для управления элементами DOM.

Конструктор класса:

- `constructor(protected readonly container: HTMLElement) {}`- принимает только один параметр - `container`, имеющий тип `HTMLElement`.

Методы:

- `toggleVisibility(element: HTMLElement, isVisible: boolean)` - переключает видимость элемента.
- `setText(element: HTMLElement, text: string)` - устанавливает текстовое содержимое.
- `disableElement(element: HTMLElement, isDisabled: boolean)` - блокирует элемент.
- `protected setImage(element: HTMLImageElement, src: string, alt?: string)` - устанавливает изображение с альтернативным текстом.
- `protected setHidden(element: HTMLElement)` - скрывает элемент.
- `protected setVisible(element: HTMLElement)` - показывает элемент.
- `renderContent(data?: object): HTMLElement` - возвращает DOM-элемент.

### Компоненты модели данных

#### Класс AppStatus

Класс для хранения текущего состояния приложения: данных о товарах, корзине, превью, заказе и ошибок форм. Наследуется от `Model<IAppStatus>`.

Поля класса:

- `catalog: ICard[]` - товары в каталоге.
- `basket: ICard[] = []` - товары в корзине.
- `order: IOrder` - состояние заказа.
- `preview: string | null` - текущий товар в модальном окне.
- `formErrors: FormErrors = {}` - ошибки форм.

Методы класса:

- `setCards()` - задает каталог товаров.
- `setPreview()` - показывает товар в модальном окне.
- `addItemToBasket()` - добавляет товар в корзину.
- `removeItemFromBasket()` - удаляет товар из корзины.
- `setOrdersDelivery()` - задает данные для доставки и проверяет их корректность.
- `setOrdersContacts()` - задает контактные данные и проверяет их корректность.
- `checkDeliveryValidation()` - валидация формы с адресом доставки и выбором способа оплаты.
- `checkContactsValidation()` - валидация формы с почтой и телефоном.
- `clearBasket()` - очищает корзину.

#### Класс basket

Класс для отображения товаров в корзине и управления ими.

Конструктор класса:

`constructor(container: HTMLElement, protected events: EventEmitter)` - инициализирует элементы корзины с контейнером и объектом событий для кнопки оформления заказа.

Свойства класса:

- `_list: HTMLElement` - список товаров в корзине.
- `_total: HTMLElement` - итоговая стоимость.
- `_button: HTMLButtonElement` - кнопка заказа.

Методы:

- `set items(items: HTMLElement[])` - устанавливает список товаров.
- `set total(total: number)` - устанавливает итоговую стоимость.

#### Класс card

Класс для отображения карточки товара.

Конструктор класса:
`constructor(container: HTMLElement, actions?: ICardActions)` - принимает `container` и действия для карточки.

Свойства класса:

-`_category`, `_title`, `_image`, `_description`, `_button`, `_price`, `_count` - элементы для отображения информации о товаре.

Методы:

- `set id(value: string)` - устанавливает идентификатор товара.
- `get id(): string` - получает идентификатор товара.
- `set title(value: string)` - устанавливает название товара.
- `get title(): string` - получает название товара.
- `set image(value: string)` - устанавливает изображение товара.
- `set description(value: string | string[])` - устанавливает описание товара.
- `set price: number | nul` - устанавливает стоимость товара.
- `set category(): string ` - устанавливает категорию товара.

#### Класс OrdersContacts

Класс отвечает за управление контактной информацией пользователя при оформлении заказа.

Конструктор класса:

- `constructor(container: HTMLFormElement, events: IEvents)` - Принимает `HTML-элемент` формы и объект событий `events`. Вызывает конструктор родительского класса `Form`.

Методы:

- `set phone(value: string)` - устанавливает номер телефона пользователя в форме.
- `set email(value: string)` - устанавливает адрес электронной почты пользователя в форме.

#### Класс OrdersDelivery

Класс отвечает за управление данными о доставке.

Конструктор класса:

- `constructor(container: HTMLFormElement, events: IEvents, actions: IActions)` - Принимает `HTML-форму`, объект событий и объект доступных действий `actions`. Вызывает конструктор родительского класса `Form`.

Свойства класса:

- `protected _card: HTMLButtonElement` - кнопка выбора оплаты картой.
- `protected _cash: HTMLButtonElement;` - кнопка выбора оплаты наличными.

Методы:

- `set address(value: string)` - устанавливает адрес доставки в соответствующее поле формы.

#### Класс product

Класс отвечает за формирование главной страницы и управление её элементами, такими как каталог товаров, корзина и счетчик товаров.

Конструктор класса:

- `constructor(container: HTMLElement, protected events: IEvents)` - Принимает контейнер `HTMLElement` и объект событий для взаимодействия с элементами страницы.

Свойства класса:

- `_counter: HTMLElement` - отображает счетчик товаров в корзине.
- `_catalog: HTMLElement` - список карточек товаров.
- `_wrapper: HTMLElement` - основной контейнер страницы.
- `_basket: HTMLElement` - иконка корзины на странице.

Методы:

- `set counter(value: number)` - изменяет отображаемое количество товаров в корзине.
- `set catalog(items: HTMLElement[])` - добавляет массив карточек товаров в каталог на странице.
- `set locked(value: boolean)` - управляет состоянием блокировки экрана.

#### Класс success

Класс отвечает за отображение сообщения об успешном оформлении заказа.

Конструктор класса:
`constructor(container: HTMLElement, actions: ISuccessActions)` - Принимает контейнер `HTMLElement` для сообщения и объект доступных действий `actions`, которые могут быть выполнены при успешном заказе.

Свойства класса:

- `protected _close: HTMLElement` - элемент для закрытия сообщения об успехе.
- `protected _total: HTMLElement` - отображает итоговую стоимость заказа.

Методы:

- `set total` (total: number) - устанавливает итоговую стоимость заказа.
