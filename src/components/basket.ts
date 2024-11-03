import { IBasket, IBasketActions, IBasketProduct } from '../types';
import { ensureElement, createElement } from '../utils/utils';
import { UserInterfaceComponent } from '../components/base/userInterfaceComponent';
import { EventEmitter } from './base/events';

export class Basket extends UserInterfaceComponent<IBasket> {
	protected _list: HTMLElement;
	protected _total: HTMLElement;
	protected _button: HTMLButtonElement;

	constructor(container: HTMLElement, protected events: EventEmitter) {
		super(container);

		this._list = ensureElement<HTMLElement>('.basket__list', this.container);
		this._total = this.container.querySelector('.basket__price');
		this._button = this.container.querySelector('.basket__button');

		if (this._button) {
			this._button.addEventListener('click', () => {
				events.emit('order:open');
			});
		}

		this.items = [];
	}

	set items(items: HTMLElement[]) {
		if (items.length) {
			this._list.replaceChildren(...items);
			this._button.disabled = false;
		} else {
			this._list.replaceChildren(
				createElement<HTMLParagraphElement>('p', {
					textContent: 'Корзина пуста',
				})
			);
			this._button.disabled = true;
		}
	}

	set total(total: number) {
		this.setText(this._total, `${total.toString()} синапсов`);
	}

	toggleButton(state: boolean) {
		this.disableElement(this._button, state);
	}
}

export class BasketProduct extends UserInterfaceComponent<IBasketProduct> {
	protected _deleteButton: HTMLButtonElement;
	protected _index: HTMLElement;
	protected _title: HTMLElement;
	protected _price: HTMLElement;

	constructor(container: HTMLElement, actions?: IBasketActions) {
		super(container);

		this._deleteButton = ensureElement<HTMLButtonElement>(
			'.card__button',
			container
		);
		this._index = ensureElement<HTMLElement>('.basket__item-index', container);
		this._title = ensureElement<HTMLElement>('.card__title', container);
		this._price = ensureElement<HTMLElement>('.card__price', container);

		if (this._deleteButton) {
			this._deleteButton.addEventListener('click', (evt) => {
				this.container.remove();
				actions?.onClick(evt);
			});
		}
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	set index(value: number) {
		this.setText(this._index, value);
	}

	set price(value: number) {
		this.setText(this._price, value + ' синапсов');
	}
}
