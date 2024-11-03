export abstract class UserInterfaceComponent<T> {
	protected constructor(protected readonly container: HTMLElement) {}

	toggleVisibility(element: HTMLElement, isVisible: boolean) {
		element.style.display = isVisible ? 'block' : 'none';
	}

	toggleClass(element: HTMLElement, className: string, force?: boolean) {
		element.classList.toggle(className, force);
	}

	protected setText(element: HTMLElement, value: unknown) {
		if (element) {
			element.textContent = String(value);
		}
	}

	disableElement(element: HTMLElement, isDisabled: boolean) {
		if (element) {
			if (isDisabled) element.setAttribute('disabled', 'disabled');
			else element.removeAttribute('disabled');
		}
	}

	protected setImage(element: HTMLImageElement, src: string, alt?: string) {
		if (element) {
			element.src = src;
			if (alt) {
				element.alt = alt;
			}
		}
	}

	protected setHidden(element: HTMLElement) {
		element.style.display = 'none';
	}

	protected setVisible(element: HTMLElement) {
		element.style.removeProperty('display');
	}

	renderContent(data?: object): HTMLElement {
		if (data) {
			Object.assign(this, data);
		}
		return this.container;
	}
}
