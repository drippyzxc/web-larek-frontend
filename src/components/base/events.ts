import { EventName, Subscriber, EmitterEvent, IEvents } from '../../types';

export class EventEmitter implements IEvents {
	events: Map<EventName, Set<Subscriber>>;

	constructor() {
		this.events = new Map<EventName, Set<Subscriber>>();
	}

	on<T extends object>(eventName: EventName, callback: (event: T) => void) {
		if (!this.events.has(eventName)) {
			this.events.set(eventName, new Set<Subscriber>());
		}
		this.events.get(eventName)?.add(callback);
	}

	off(eventName: EventName, callback: Subscriber) {
		if (this.events.has(eventName)) {
			this.events.get(eventName)!.delete(callback);
			if (this.events.get(eventName)?.size === 0) {
				this.events.delete(eventName);
			}
		}
	}

	emit<T extends object>(eventName: string, data?: T) {
		this.events.forEach((subscribers, name) => {
			if (
				(name instanceof RegExp && name.test(eventName)) ||
				name === eventName
			) {
				subscribers.forEach((callback) => callback(data));
			}
		});
	}

	onAll(callback: (event: EmitterEvent) => void) {
		this.on('*', callback);
	}

	offAll() {
		this.events = new Map<string, Set<Subscriber>>();
	}

	trigger<T extends object>(eventName: string, context?: Partial<T>) {
		return (event: object = {}) => {
			this.emit(eventName, {
				...(event || {}),
				...(context || {}),
			});
		};
	}
}
