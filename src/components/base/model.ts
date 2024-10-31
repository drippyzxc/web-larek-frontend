import { IEvents } from '../../types';

export const isModel = (obj: unknown): obj is Model<any> => {
	return obj instanceof Model;
};

export abstract class Model<T> {
	constructor(data: Partial<T>, protected events: IEvents) {
		Object.assign(this, data);
	}

	notifyChange(event: string, payload?: object) {
		this.events.emit(event, payload ?? {});
	}
}
