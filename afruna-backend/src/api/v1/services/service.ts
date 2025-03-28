import Repository from '@repositories/repository';
import observer from '@helpers/observer';
import dayjs from 'dayjs';
import { logger } from '@utils/logger';
// single model methods
export default abstract class Service<T, R extends Repository<T>> {
  protected abstract repository: R;
  protected observables?: Record<string, Function>;
  protected observer = observer();

  constructor() {
    if (this.observables) {
      Object.entries(this.observables).forEach(([key, value]) => {
        this.observer.add(key, value.call(this));
      });
    }
  }

  forEveryInterval = async <T>(
    interval: 'hour' | 'day' | 'week' | 'month',
    startDate: dayjs.Dayjs,
    endDate: dayjs.Dayjs,
    callback: (_currentDay: dayjs.Dayjs) => Promise<T>,
  ) => {
    const result: T[] = [];
    let currentDay = startDate.startOf('day');
    const _endDate = dayjs(endDate).add(1, 'day');

    while (currentDay.isBefore(_endDate, 'day')) {
      const data = await callback(currentDay); //.then((data) => {
      result.push(data);
      currentDay = currentDay.add(1, interval);
      // });
    }

    return result;
  };

  find(
    query?:
      | Partial<
          DocType<T> & {
            page?: string | number | undefined;
            limit?: string | number | undefined;
          }
        >
      | undefined,
    options?: OptionsParser<T>,
  ): Promise<DocType<T>[]> {
    return this.repository.find(query, options);
  }

  findOne(
    query: string | Partial<DocType<T>>,
    options?: Omit<OptionsParser<T>, 'sort' | 'limit' | 'skip'> | undefined,
  ) {
    return this.repository.findOne(query, options);
  }

  create(data: Partial<T>) {
    return this.repository.create(data);
  }

  update(
    query: string | Partial<T>,
    data:
      | Partial<T> & {
          load?: { key: string; value: any; toSet?: boolean | undefined } | undefined;
          unload?: { key: keyof T; value: string | string[]; field?: string | undefined } | undefined;
          increment?: { key: keyof T; value: number } | undefined;
        } & { $setOnInsert?: Partial<T> },
    upsert = false,
    many = false,
  ) {
    return this.repository.update(query, data, upsert, many);
  }

  delete(query: string | Partial<T>) {
    return this.repository.delete(query);
  }

  count(query?: Partial<DocType<T>>) {
    return this.repository.count(query);
  }

  paginatedFind(
    query?: Partial<DocType<T> & { page?: number | string; limit?: number | string } & { $or: any; $and: any }>,
    customSort: { [key in keyof Partial<DocType<T>>]: 1 | -1 } | undefined = undefined,
    populate: PopulateType[] | undefined = undefined,
  ) {
    return new Promise<{
      data: DocType<T>[];
      limit: number;
      totalDocs: number;
      page: number;
      totalPages: number;
    }>((resolve, reject) => {
      query = query || {};
      let page: number = 1;
      let limit: number = 10;

      if (query?.page) {
        typeof query.page === 'string'
          ? ((page = parseInt(query.page, 10)), delete query.page)
          : (query.page, delete query.page);
      }

      if (query?.limit) {
        typeof query.limit === 'string'
          ? ((limit = parseInt(query.limit, 10)), delete query.limit)
          : (query.limit, delete query.limit);
      }

      query = Object.entries(query).length >= 1 ? query : {};
      const startIndex = limit * (page - 1);
      let totalDocs = 0;

      this.count(query)
        .then((_totalDocs) => {
          totalDocs = _totalDocs;
          const opts: OptionsParser<T> = { sort: customSort || { createdAt: -1 }, skip: startIndex, limit };

          if (Array.isArray(query?.$and) && query?.$and.length > 0) {
            Object.assign(opts, {
              and: query.$and,
            });
            delete query.$and;
          }

          if (Array.isArray(query?.$or) && query?.$or.length > 0) {
            Object.assign(opts, {
              or: query.$or,
            });
            delete query.$or;
          }

          if (populate) {
            Object.assign(opts, {
              multiPopulate: populate,
            });
          }

          return this.find(query, opts);
        })
        .then((data) => {
          const totalPages = Math.floor(totalDocs / limit) + 1;

          const result = {
            data: <DocType<T>[]>data,
            limit,
            totalDocs,
            page,
            totalPages,
          };

          resolve(result);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  custom() {
    return this.repository.custom();
  }
}
