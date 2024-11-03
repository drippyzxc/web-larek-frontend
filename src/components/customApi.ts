import { IOrderSuccess, IOrderAPI, ICard, IApi } from '../types';
import { Api, ApiListResponse } from './base/api';

export class CustomApi extends Api implements IApi {
	readonly cdn: string;

	constructor(cdn: string, baseUrl: string, options?: RequestInit) {
		super(baseUrl, options);
		this.cdn = cdn;
	}

	getCardItem(id: string): Promise<ICard> {
		return this.get(`/product/${id}`).then((item: ICard) => ({
			...item,
			image: this.cdn + item.image,
		}));
	}

	getCardsList(): Promise<ICard[]> {
		return this.get('/product').then((data: ApiListResponse<ICard>) =>
			data.items.map((item) => ({
				...item,
				image: this.cdn + item.image,
			}))
		);
	}

	orderProducts(order: IOrderAPI): Promise<IOrderSuccess> {
		return this.post('/order', order).then((data: IOrderSuccess) => data);
	}

	orderProductsSuccess(order: IOrderAPI) {
		return this.post('/order', order)
			.then((result: IOrderSuccess) => {
				result;
			})
			.catch((err) => {
				console.error(err);
			});
	}
}
