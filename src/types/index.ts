export type EventName = string | RegExp;
export type Subscriber = Function;
export type EmitterEvent = {
	eventName: string;
	data: unknown;
};

export interface IEvents {
	on<T extends object>(event: EventName, callback: (data: T) => void): void;
	emit<T extends object>(event: string, data?: T): void;
	trigger<T extends object>(
		event: string,
		context?: Partial<T>
	): (data: T) => void;
}

export interface IApi {
	getCardItem: (id: string) => Promise<ICard>;
	getCardsList: () => Promise<ICard[]>;
}

export interface IAppStatus {
	catalog: IProduct[];
	basket: IProduct[];
	preview: string | null;
	order: IOrder | null;
}

export interface IPage {
	counter: number;
	catalog: HTMLElement[];
	locked: boolean;
}

export interface ICard {
	id: string;
	description: string;
	image: string;
	title: string;
	category: string;
	price: number | null;
	getId(): string;
}

export interface IProduct extends ICard {
	button?: string;
}

export interface IButtonOptions {
	disabledButton: boolean;
	buttonText: string;
	isInBasket?: boolean;
}

export interface IOrdersDelivery {
	payment: string;
	address: string;
}

export interface IOrdersContacts {
	email: string;
	phone: string;
}

export interface IOrder {
	id: string;
	payment: string;
	email: string;
	phone: string;
	address: string;
	total: number;
	items: IProduct[];
}

export interface IOrderAPI {
	payment: string;
	email: string;
	phone: string;
	address: string;
	total: number;
	items: string[];
}

export interface IOrderSuccess {
	id: string[];
	total: number;
}

export interface ISuccess {
	total: number;
}

export interface IBasket {
	items: HTMLElement[];
	total: number;
	button: HTMLButtonElement;
}

export interface IBasketModel {
	items: IProduct[];
	getTotal(): number;
	add(id: IProduct): void;
	remove(id: IProduct): void;
	clearBasket(): void;
}

export interface IBasketProduct {
	deleteButton: string;
	index: number;
	title: string;
	price: number;
}

export interface IModalData {
	content: HTMLElement;
}

export interface IBasketActions {
	onClick: (event: MouseEvent) => void;
}

export interface IEventEmitter {
	emit: (event: string, data: unknown) => void;
}

export type IOrderForm = IOrdersDelivery & IOrdersContacts;
export type IFormErrors = Partial<Record<keyof IOrder, string>>;
