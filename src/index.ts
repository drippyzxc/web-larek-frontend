import './scss/styles.scss';

import { CustomApi } from './components/customApi';
import { API_URL, CDN_URL } from './utils/constants';
import { EventEmitter } from './components/base/events';
import { AppStatus, Product } from './components/AppData';
import { Page } from './components/product';
import { cloneTemplate, createElement, ensureElement } from './utils/utils';
import { Modal } from './components/common/modal';
import { Basket, BasketProduct } from './components/basket';
import { IOrderForm, IButtonOptions } from './types';
import { Card } from './components/card';
import { OrdersDelivery, OrdersContacts } from './components/order';
import { Success } from './components/success';

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

const ordersDelivery = new OrdersDelivery(cloneTemplate(orderTemplate), events);
const ordersContacts = new OrdersContacts(
	cloneTemplate(ordersContactsTemplate),
	events
);

events.on('items:changed', () => {
	page.catalog = appStatus.getProducts().map((item) => {
		const card = new Card(cloneTemplate(cardCatalogTemplate), null, {
			onClick: () => events.emit('preview:changed', item),
		});
		return card.renderContent(item);
	});
});

events.on('card:select', (item: Product) => {
	appStatus.setPreview(item);
});

events.on('preview:changed', (item: Product) => {
	const showCard = (item: Product, buttonOptions: IButtonOptions) => {
		const card = new Card(cloneTemplate(cardPreviewTemplate), buttonOptions, {
			onClick: () => events.emit('item:add', item),
		});

		modal.render({
			content: card.renderContent(item),
		});
	};

	if (item) {
		api
			.getCardItem(item.id)
			.then((result) => {
				item.description = result.description;
				showCard(item, {
					disabledButton: appStatus.findOrderItem(item) != null,
					buttonText: 'Уже в корзине',
				});
			})
			.catch(console.error);
	} else {
		modal.close();
	}
});

events.on('item:add', (item: Product) => {
	appStatus.addItemToBasket(item);
	page.setCounter(appStatus.order.items.length);
	modal.close();
});

events.on('item:remove', (item: Product) => {
	appStatus.removeItemFromBasket(item);
	page.setCounter(appStatus.order.items.length);
});

events.on('basket:changed', () => {
	const basketProducts = appStatus.order.items.map((item, index) => {
		const basketItem = new BasketProduct(cloneTemplate(cardBasketTemplate), {
			onClick: () => events.emit('item:remove', item),
		});
		return basketItem.renderContent({
			title: item.title,
			price: item.price,
			index: index + 1,
		});
	});
	basket.renderContent({
		items: basketProducts,
		total: appStatus.getTotal(),
	});
});

events.on('basket:open', () => {
	page.setCounter(appStatus.order.items.length);
	modal.render({
		content: createElement<HTMLElement>('div', {}, [
			basket.renderContent({
				total: appStatus.getTotal(),
			}),
		]),
	});
});

events.on('order:open', () => {
	modal.render({
		content: ordersDelivery.render({
			address: ordersDelivery.address,
			payment: ordersDelivery.payment,
			valid: false,
			errors: [],
		}),
	});
});

events.on(
	/^(order|contacts)\..*:change/,
	(data: { field: keyof IOrderForm; value: string }) => {
		appStatus.setOrderField(data.field, data.value);
	}
);

events.on('formErrors:change', (errors: Partial<IOrderForm>) => {
	const { address, payment } = errors;
	ordersDelivery.valid = !address && !payment;
	ordersDelivery.errors = Object.values({ address, payment })
		.filter((i) => !!i)
		.join(' и ');
});
events.on('formErrorsContacts:change', (errors: Partial<IOrderForm>) => {
	const { email, phone } = errors;
	ordersContacts.valid = !email && !phone;
	ordersContacts.errors = Object.values({ phone, email })
		.filter((i) => !!i)
		.join(' и ');
});

events.on('order:submit', () => {
	modal.render({
		content: ordersContacts.render({
			phone: '',
			email: '',
			valid: false,
			errors: [],
		}),
	});
});

events.on('success:open', () => {
	api
		.orderProducts(appStatus.getOrderAPI())
		.then(() => {
			const success = new Success(cloneTemplate(successTemplate), events);
			success.total = appStatus.getTotal();
			modal.close();
			appStatus.clearBasket();
			page.counter = appStatus.basket.length;
			modal.render({
				content: success.renderContent({}),
			});
		})
		.catch(console.error);
});

events.on('success:close', () => {
	modal.close();
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
