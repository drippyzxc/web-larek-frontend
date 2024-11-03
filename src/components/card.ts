import { IProduct, IButtonOptions } from '../types';
import { ensureElement } from '../utils/utils';
import { UserInterfaceComponent } from '../components/base/userInterfaceComponent';

interface ICardActions {
	onClick: (event: MouseEvent) => void;
}

export class Card extends UserInterfaceComponent<IProduct> {
	protected _category?: HTMLElement;
	protected _title: HTMLElement;
	protected _image?: HTMLImageElement;
	protected _description?: HTMLElement;
	protected _price?: HTMLElement;
	_button?: HTMLButtonElement;

	constructor(
		protected container: HTMLElement,
		buttonOptions?: IButtonOptions,
		actions?: ICardActions
	) {
		super(container);

		this._category = container.querySelector('.card__category');
		this._title = ensureElement<HTMLElement>('.card__title', container);
		this._image = container.querySelector('.card__image');
		this._description = container.querySelector('.card__text');
		this._price = ensureElement<HTMLElement>('.card__price', container);
		this._button = container.querySelector('.card__button');

		if (buttonOptions?.disabledButton) {
			this.disableElement(this._button, true);
			this.setText(this._button, buttonOptions.buttonText);
		}

		if (actions?.onClick) {
			if (this._button) {
				this._button.addEventListener('click', actions.onClick);
			} else {
				container.addEventListener('click', actions.onClick);
			}
		}
	}

	set id(value: string) {
		this.container.dataset.id = value;
	}

	get id(): string {
		return this.container.dataset.id || '';
	}

	set title(value: string) {
		this.setText(this._title, value);
	}

	get title(): string {
		return this._title.textContent || '';
	}

	set image(value: string) {
		this.setImage(this._image, value, this.title);
	}

	set description(value: string | string[]) {
		if (Array.isArray(value)) {
			this._description.replaceWith(
				...value.map((str) => {
					const descTemplate = this._description.cloneNode() as HTMLElement;
					this.setText(descTemplate, str);
					return descTemplate;
				})
			);
		} else {
			this.setText(this._description, value);
		}
	}

	set price(value: number | null) {
		this.setText(this._price, value ? `${value} синапсов` : 'Бесценно');
		if (value === null) {
			this.disableElement(this._button, true);
			this.setText(this._button, 'Нельзя купить');
		}
	}

	set category(value: string) {
		const categoryMap: Record<string, string> = {
			'софт-скил': 'soft',
			'хард-скил': 'hard',
			другое: 'other',
			дополнительное: 'additional',
			кнопка: 'button',
		};

		const enCategory = categoryMap[value];

		Object.values(categoryMap).forEach((category) => {
			this.toggleClass(this._category, `card__category_${category}`, false);
		});
		this.toggleClass(this._category, `card__category_${enCategory}`, true);
		this.setText(this._category, value);
	}

	setDisabled() {
		this._button.disabled = true;
	}
}
