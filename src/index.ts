import './scss/styles.scss';

import { AppStatus, CatalogChangeEvent } from './components/AppData';
import { EventEmitter } from './components/base/events';
import { cloneTemplate, ensureElement } from './utils/utils';
import { Page } from './components/product';
import { Card } from './components/card';
import { CustomApi } from './components/customApi';
import { API_URL, CDN_URL } from './utils/constants';
import { Modal } from './components/common/modal';
import { Basket } from './components/basket';
import {
	OrdersDelivery,
	paymentMethod,
	OrdersContacts,
} from './components/order';
import { Success } from './components/success';
import { ICard, IOrdersContacts, IOrdersDelivery } from './types';

const events = new EventEmitter();
const api = new CustomApi(CDN_URL, API_URL);

const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const cardPreviewTemplate = ensureElement<HTMLTemplateElement>('#card-preview');
const cardBasketTemplate = ensureElement<HTMLTemplateElement>('#card-basket');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const ordersContactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successTemplate = ensureElement<HTMLTemplateElement>('#success');

const appStatus = new AppStatus({}, events);

const page = new Page(document.body, events);
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const basket = new Basket(cloneTemplate(basketTemplate), events);

const ordersDelivery = new OrdersDelivery(
	cloneTemplate(orderTemplate),
	events,
	{
		onClick: (event: Event) => {
			events.emit('payment:changed', event.target);
		},
	}
);
const ordersContacts = new OrdersContacts(
	cloneTemplate(ordersContactsTemplate),
	events
);

events.on<CatalogChangeEvent>('items:changed', () => {
	page.catalog = appStatus.catalog.map((item) => {
		const card = new Card(cloneTemplate(cardCatalogTemplate), {
			onClick: () => events.emit('card:select', item),
		});
		return card.renderContent({
			category: item.category,
			title: item.title,
			image: item.image,
			price: item.price,
		});
	});
});

events.on('card:select', (item: ICard) => {
	appStatus.setPreview(item);
});

events.on('preview:changed', (item: ICard) => {
	const card = new Card(cloneTemplate(cardPreviewTemplate), {
		onClick: () => {
			events.emit('item:check', item);
			if (appStatus.basket.indexOf(item) < 0) {
				card.buttonText = 'В корзину';
			} else {
				card.buttonText = 'Убрать из корзины';
			}
		},
	});

	modal.render({
		content: card.renderContent({
			category: item.category,
			title: item.title,
			image: item.image,
			description: item.description,
			price: item.price,
			buttonText:
				appStatus.basket.indexOf(item) < 0 ? 'В корзину' : 'Убрать из корзины',
		}),
	});
});

events.on('item:check', (item: ICard) => {
	appStatus.basket.indexOf(item) < 0
		? events.emit('item:add', item)
		: events.emit('item:delete', item);
});

events.on('item:add', (item: ICard) => {
	appStatus.addItemToBasket(item);
});

events.on('item:delete', (item: ICard) => {
	appStatus.removeItemFromBasket(item);
});

events.on('basket:changed', (items: ICard[]) => {
	basket.items = items.map((item, count) => {
		const card = new Card(cloneTemplate(cardBasketTemplate), {
			onClick: () => {
				events.emit('item:delete', item);
			},
		});
		return card.renderContent({
			title: item.title,
			price: item.price,
			count: (count++).toString(),
		});
	});
	let total = 0;
	items.forEach((item) => {
		total = total + item.price;
	});
	basket.total = total;
	appStatus.order.total = total;
});

events.on('count:changed', () => {
	page.counter = appStatus.basket.length;
});

events.on('basket:open', () => {
	modal.render({
		content: basket.renderContent({}),
	});
});

events.on('order:open', () => {
	modal.render({
		content: ordersDelivery.render({
			payment: '',
			address: '',
			valid: false,
			errors: [],
		}),
	});
	appStatus.order.items = appStatus.basket.map((item) => item.id);
});

events.on('payment:changed', (target: HTMLElement) => {
	if (!target.classList.contains('button_alt-active')) {
		ordersDelivery.changeButtonsClasses();
		appStatus.order.payment = paymentMethod[target.getAttribute('name')];
	}
});

events.on(
	/^order\..*:change/,
	(data: { field: keyof IOrdersDelivery; value: string }) => {
		appStatus.setOrdersDelivery(data.field, data.value);
	}
);

events.on('deliveryForm:changed', (errors: Partial<IOrdersDelivery>) => {
	const { payment, address } = errors;
	ordersDelivery.valid = !payment && !address;
	ordersDelivery.errors = Object.values({ payment, address })
		.filter((i) => !!i)
		.join('; ');
});

events.on('ordersDelivery:changed', () => {
	ordersDelivery.valid = true;
});

events.on('order:submit', () => {
	modal.render({
		content: ordersContacts.render({
			email: '',
			phone: '',
			valid: false,
			errors: [],
		}),
	});
	appStatus.order.items = appStatus.basket.map((item) => item.id);
});

events.on(
	/^contacts\..*:change/,
	(data: { field: keyof IOrdersContacts; value: string }) => {
		appStatus.setOrdersContacts(data.field, data.value);
	}
);

events.on('contactsForm:changed', (errors: Partial<IOrdersContacts>) => {
	const { email, phone } = errors;
	ordersContacts.valid = !email && !phone;
	ordersContacts.errors = Object.values({ email, phone })
		.filter((i) => !!i)
		.join('; ');
});

events.on('ordersContacts:changed', () => {
	ordersContacts.valid = true;
});

events.on('contacts:submit', () => {
	api
		.orderProducts(appStatus.order)
		.then((result) => {
			appStatus.clearBasket();
			const success = new Success(cloneTemplate(successTemplate), {
				onClick: () => {
					modal.close();
				},
			});
			console.log(result);
			success.total = result.total.toString();
			modal.render({
				content: success.renderContent({}),
			});
		})
		.catch((error) => {
			console.error(error);
		});
});

events.on('modal:open', () => {
	page.locked = true;
});

events.on('modal:close', () => {
	page.locked = false;
});

api
	.getCardsList()
	.then(appStatus.setCards.bind(appStatus))
	.catch(console.error);
