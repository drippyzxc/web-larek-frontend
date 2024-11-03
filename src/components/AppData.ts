import { Model } from './base/model';
import {
	IFormErrors,
	IAppStatus,
	IOrderAPI,
	IProduct,
	IOrder,
	IOrderForm,
	IOrdersDelivery,
	IOrdersContacts,
} from '../types/index';

export type CatalogChangeEvent = {
	catalog: Product[];
};

export class Product extends Model<IProduct> {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
	isOrdered: boolean;
	index: number;
	getId(): string {
		return this.id;
	}
}

export class AppStatus extends Model<IAppStatus> {
	basket: string[] = [];
	_catalog: Product[];
	loading: boolean;
	orderAddress: IOrdersDelivery = {
		payment: '',
		address: '',
	};

	contacts: IOrdersContacts = {
		email: '',
		phone: '',
	};

	protected _order: IOrder = {
		id: '',
		payment: '',
		email: '',
		phone: '',
		address: '',
		total: 0,
		items: [],
	};
	preview: string | null;
	formErrors: IFormErrors = {};

	get order() {
		return this._order;
	}

	getOrderAPI() {
		const orderApi: IOrderAPI = {
			payment: this._order.payment,
			email: this._order.email,
			phone: this._order.phone,
			address: this._order.address,
			total: 0,
			items: [],
		};
		orderApi.items = this._order.items.map((item) => item.id);
		orderApi.total = this.getTotal();
		return orderApi;
	}

	getProducts(): Product[] {
		return this._catalog;
	}

	findOrderItem(item: Product) {
		const orderItemIndex = this._order.items.findIndex(
			(id) => id.getId() === item.id
		);

		if (orderItemIndex !== -1) {
			return orderItemIndex;
		} else {
			return null;
		}
	}

	addItemToBasket(item: Product) {
		if (this.findOrderItem(item) === null) {
			this._order.items.push(item);
			this.notifyChange('basket:changed');
		}
	}

	removeItemFromBasket(item: Product) {
		this._order.items = this._order.items.filter((el) => el.id != item.id);
		this.notifyChange('basket:changed');
	}

	getTotal() {
		this._order.total = this._order.items.reduce((a, c) => a + c.price, 0);
		return this._order.total;
	}

	setCards(items: IProduct[]) {
		this._catalog = items.map((item) => new Product(item, this.events));
		this.notifyChange('items:changed', { catalog: this._catalog });
	}

	setPreview(item: Product) {
		this.preview = item.id;
		this.notifyChange('preview:changed', item);
	}

	updateCounter(): number {
		return this.basket.length;
	}

	setOrderField(field: keyof IOrderForm, value: string) {
		this.order[field] = value;

		if (this.validateOrderDelivery()) {
			this.events.emit('order:ready', this.order);
		}

		if (this.validateOrderContact()) {
			this.events.emit('order:ready', this.order);
		}
	}

	validateOrderDelivery() {
		const errors: typeof this.formErrors = {};

		if (!this.order.address) {
			errors.address =
				'Пожалуйста, введите адрес, используя допустимые символы: кириллицу, пробелы, запятые, точки и тире.';
		}
		if (!this.order.payment) {
			errors.payment = 'Пожалуйста, выберете способ оплаты.';
		}

		this.formErrors = errors;
		this.events.emit('formErrors:change', this.formErrors);

		return Object.keys(errors).length === 0;
	}

	validateOrderContact() {
		const errors: typeof this.formErrors = {};

		if (!this.order.email) {
			errors.email =
				'Пожалуйста, укажите адрес электронной почты в формате email@email.com.';
		}

		if (!this.order.phone) {
			errors.phone =
				'Пожалуйста, введите номер телефона в одном из следующих форматов: +7ХХХХХХХХХХ или 8ХХХХХХХХХХ.';
		}

		this.formErrors = errors;
		this.events.emit('formErrorsContacts:change', this.formErrors);

		return Object.keys(errors).length === 0;
	}

	clearBasket() {
		this._order.items = [];
		this.notifyChange('basket:changed');
	}
}
