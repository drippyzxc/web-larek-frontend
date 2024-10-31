import { IEvents, IOrdersContacts, IActions, IOrder } from '../types';
import { Form } from './common/form';
import { ensureElement } from '../utils/utils';

export class OrdersContacts extends Form<IOrdersContacts> {
	constructor(container: HTMLFormElement, events: IEvents) {
		super(container, events);
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

export const paymentMethod: { [key: string]: string } = {
	card: 'online',
	cash: 'cash',
};

export class OrdersDelivery extends Form<IOrder> {
	protected _card: HTMLButtonElement;
	protected _cash: HTMLButtonElement;

	constructor(container: HTMLFormElement, events: IEvents, actions: IActions) {
		super(container, events);

		this._card = ensureElement<HTMLButtonElement>('#card', this.container);
		this._cash = ensureElement<HTMLButtonElement>('#cash', this.container);
		this._card.classList.add('button_alt-active');

		if (actions.onClick) {
			this._card.addEventListener('mouseup', actions.onClick);
			this._cash.addEventListener('mouseup', actions.onClick);
		}
	}

	set address(value: string) {
		(this.container.elements.namedItem('address') as HTMLInputElement).value =
			value;
	}

	changeButtonsClasses() {
		this._card.classList.toggle('button_alt-active');
		this._cash.classList.toggle('button_alt-active');
	}
}
