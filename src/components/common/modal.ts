import { UserInterfaceComponent } from '../base/userInterfaceComponent';
import { ensureElement } from '../../utils/utils';
import { IEvents } from '../../types';

interface IModalData {
	content: HTMLElement;
}

export class Modal extends UserInterfaceComponent<IModalData> {
	protected _closeButton: HTMLButtonElement;
	protected _content: HTMLElement;

	constructor(container: HTMLElement, protected events: IEvents) {
		super(container);

		this._closeButton = ensureElement<HTMLButtonElement>(
			'.modal__close',
			container
		);
		this._content = ensureElement<HTMLElement>('.modal__content', container);

		this._closeButton.addEventListener('click', this.close.bind(this));
		this.container.addEventListener('mousedown', this.close.bind(this));
		this._content.addEventListener('mousedown', (event) =>
			event.stopPropagation()
		);
	}

	set content(value: HTMLElement) {
		this._content.replaceChildren(value);
	}

	open() {
		this.container.classList.add('modal_active');
		this.events.emit('modal:open');
	}

	close() {
		this.container.classList.remove('modal_active');
		this.content = null;
		this.events.emit('modal:close');
	}

	render(data: IModalData): HTMLElement {
		super.renderContent(data);
		this.open();
		return this.container;
	}
}
