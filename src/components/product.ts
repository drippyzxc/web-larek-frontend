import { IEvents, IPage } from '../types';
import { UserInterfaceComponent } from './base/userInterfaceComponent';
import { ensureElement } from '../utils/utils';

export class Page extends UserInterfaceComponent<IPage> {
	protected _counter: HTMLElement;
	protected _catalog: HTMLElement;
	protected _wrapper: HTMLElement;
	protected _basket: HTMLElement;

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		this._counter = ensureElement<HTMLElement>('.header__basket-counter');
		this._catalog = ensureElement<HTMLElement>('.gallery');
		this._wrapper = ensureElement<HTMLElement>('.page__wrapper');
		this._basket = ensureElement<HTMLElement>('.header__basket');

		this._basket.addEventListener('click', () => {
			this.events.emit('basket:open');
		});
	}

	set counter(value: number) {
		this.setText(this._counter, String(value));
	}

	set catalog(items: HTMLElement[]) {
		this._catalog.replaceChildren(...items);
	}

	set locked(value: boolean) {
		if (value) {
			this.toggleClass(this._wrapper, 'page__wrapper_locked', true);
		} else {
			this.toggleClass(this._wrapper, 'page__wrapper_locked', false);
		}
	}

	setCounter(value: number): void {
		this.setText(this._counter, String(value));
	}
}
