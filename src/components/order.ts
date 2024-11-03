import {
	IOrdersDelivery,
	IOrdersContacts,
	IOrderForm,
	IEvents,
} from '../types';
import { Form } from './common/form';
import { ensureElement } from '../utils/utils';
import { EventEmitter } from './base/events';

export class OrdersContacts extends Form<IOrdersContacts> {
	protected _button: HTMLElement;
	protected _email: HTMLElement;
	protected _phone: HTMLElement;

	constructor(container: HTMLFormElement, events: EventEmitter) {
		super(container, events);

		this._button = container.querySelector('.button[type="submit"]');
		this._email = this.container.querySelector('input[name="email"]');
		this._phone = this.container.querySelector('button[type="submit"]');

		this.container.addEventListener('submit', (event: Event) => {
			event.preventDefault();
			this.events.emit('success:open');
		});
	}

	set phone(value: string) {
		(this.container.elements.namedItem('phone') as HTMLInputElement).value =
			value;
	}

	set email(value: string) {
		(this.container.elements.namedItem('email') as HTMLInputElement).value =
			value;
	}
}

export class OrdersDelivery extends Form<IOrdersDelivery> {
	protected _card: HTMLButtonElement;
	protected _cash: HTMLButtonElement;
	protected _paymentContainer: HTMLDivElement;
	payment: string;

	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);

		this._paymentContainer = ensureElement<HTMLDivElement>(
			'.order__buttons',
			this.container
		);
		this._card = ensureElement<HTMLButtonElement>('#card', this.container);
		this._cash = ensureElement<HTMLButtonElement>('#cash', this.container);

		if (this._card) {
			this._card.addEventListener('click', (el) => {
				el.preventDefault;
				this.toggleCard();
				this.toggleCash(false);
				this.setPayment('payment', 'Онлайн');
			});
		}
		if (this._cash) {
			this._cash.addEventListener('click', (el) => {
				el.preventDefault();
				this.toggleCash();
				this.toggleCard(false);
				this.setPayment('payment', 'При получении');
			});
		}
	}

	set address(value: string) {
		(this.container.elements.namedItem('address') as HTMLInputElement).value =
			'';
	}

	toggleCard(state: boolean = true) {
		this.toggleClass(this._card, 'button_alt-active', state);
	}

	toggleCash(state: boolean = true) {
		this.toggleClass(this._cash, 'button_alt-active', state);
	}

	setPayment(field: keyof IOrderForm, value: string) {
		this.events.emit('order.payment:change', { field, value });
	}
}
