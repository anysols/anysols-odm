import OperationInterceptorInterface from './OperationInterceptor.interface';
import Record from '../record/Record';

export default class OperationInterceptorService {
  #interceptors: Map<string, OperationInterceptorInterface>;

  constructor() {
    this.#interceptors = new Map<string, OperationInterceptorInterface>();
  }

  addInterceptor = (operationInterceptor: OperationInterceptorInterface) =>
    this.#interceptors.set(
      operationInterceptor.getName(),
      operationInterceptor
    );

  deleteInterceptor = (name: string) => this.#interceptors.delete(name);

  getInterceptor = (name: string): OperationInterceptorInterface | undefined =>
    this.#interceptors.get(name);

  hasInterceptors(): boolean {
    return this.#interceptors.size !== 0;
  }

  #getSortedIntercepts(): OperationInterceptorInterface[] {
    const intercepts = [];
    for (const interceptor of this.#interceptors.values()) {
      intercepts.push(interceptor);
    }
    return intercepts.sort((a, b) => a.getOrder() - b.getOrder());
  }

  async intercept(
    collectionName: string,
    operation: string,
    when: string,
    records: Record[],
    context: any = {},
    inactiveIntercepts: string[]
  ): Promise<Record[]> {
    if (this.hasInterceptors())
      for (const interceptor of this.#getSortedIntercepts())
        if (
          !inactiveIntercepts ||
          !inactiveIntercepts.includes(interceptor.getName())
        ) {
          records = await interceptor.intercept(
            collectionName,
            operation,
            when,
            records,
            context
          );
          if (!records) break;
        }
    return records;
  }
}
