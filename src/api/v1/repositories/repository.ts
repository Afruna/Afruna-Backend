import { OPTIONS } from '@config';
import redis from '@helpers/cache';
import { logger } from '@utils/logger';
import { ClientSession, Model, Query, Types, startSession } from 'mongoose';

export default abstract class Repository<T> {
  protected abstract model: Model<T>;
  protected useRedis = OPTIONS.USE_REDIS;
  protected cacheClient = redis;

  find(
    _query?: Partial<DocType<T>> | Array<string> | { [K in keyof DocType<T>]?: Array<DocType<T>[K]> },
    options: OptionsParser<T> | undefined = undefined,
  ) {
    return new Promise<DocType<T>[]>((resolve, reject) => {
      let query: Record<string, any> = _query || {};
      if (Array.isArray(_query) && _query.length > 0) {
        query = { _id: { $in: _query.map((val) => new Types.ObjectId(val)) } };
      } else {
        for (const [field, value] of Object.entries(query)) {
          Array.isArray(value) ? (query[field] = { $in: value }) : false;
        }
      }

      let key: string;

      if (this.useRedis) {
        key = JSON.stringify({
          ..._query,
          options,
          collection: this.model.name,
        });

        if (key in this.cacheClient!.keys) {
          this.cacheClient!.keys(key)
            .then((cacheKeys) => this.cacheClient!.get(cacheKeys[0] || 'no-value'))
            .then((cacheValue) => {
              if (cacheValue) resolve(Object.setPrototypeOf(<DocType<T>[]>JSON.parse(cacheValue), { cached: true }));
            });
        }
      }

      const q = options ? this.optionsParser(this.model.find(query), options) : this.model.find(query);

      q.lean()
        .then((r) => {
          if (this.useRedis) {
            const _k = r.map((v) => v._id).join(':');
            this.cacheClient!.set(`${key}:${_k}`, JSON.stringify(r));
          }

          resolve(<DocType<T>[]>r);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  findOne(
    query: string | Partial<DocType<T>>,
    options: Omit<OptionsParser<T>, 'sort' | 'limit' | 'skip'> | undefined = undefined,
  ) {
    return new Promise<DocType<T> | null>((resolve, reject) => {
      let key: string;

      if (this.useRedis) {
        key =
          typeof query === 'object'
            ? JSON.stringify({
                ...query,
                collection: this.model.name,
              })
            : query;

        this.cacheClient!.get(key).then((cacheValue) => {
          if (cacheValue) resolve(<DocType<T>>JSON.parse(cacheValue));
        });
      }

      const q =
        typeof query === 'object' ? this.model.findOne(query) /* .exec() */ : this.model.findById(query); /* .exec() */
      options ? this.optionsParser(q, options) : q;

      q.lean()
        .then((r) => {
          if (!r) {
            resolve(null);
          }

          if (this.useRedis) {
            this.cacheClient!.set(`${key}:${(<any>r)?._id}`, JSON.stringify(r));
          }

          resolve(<DocType<T>>r);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  update(
    query: string | Partial<T>,
    data: UpdateData<T>,
    upsert = false,
    many = false,
    session: ClientSession | undefined = undefined,
  ) {
    return new Promise<DocType<T> | null>((resolve, reject) => {
      const options = { new: true, upsert: false };
      if (upsert) {
        options.upsert = true;
      }

      if (session) {
        Object.assign(options, { session });
      }

      this.handleLoad(data).handleUnload(data).handleIncrement(data);

      const q =
        typeof query === 'object'
          ? many
            ? this.model.updateMany(query, data, options)
            : this.model.findOneAndUpdate(query, data, options)
          : this.model.findByIdAndUpdate(query, data, options);

      q.lean()
        .then((r) => {
          if (!r) {
            resolve(null);
          }

          if (this.useRedis) {
            const key =
              typeof query === 'object'
                ? JSON.stringify({
                    ...query,
                    collection: this.model.name,
                  })
                : query;
            this.cacheClient?.invalidateCache(key);
          }

          resolve(<DocType<T>>r);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  create(data: Partial<T> | Array<Partial<T>>, session: ClientSession | undefined = undefined) {
    const options = {};

    if (session) {
      Object.assign(options, { session });
    }

    return new Promise<typeof data extends Array<any> ? Array<DocType<T>> : DocType<T>>((resolve, reject) => {
      const q = Array.isArray(data) ? this.model.create(data, options) : this.model.create(data);

      q.then((user) => {
        Array.isArray(user) ? resolve(<any>user.map((u) => u.toObject())) : resolve(user.toObject());
      }).catch((e) => reject(e));
    });
  }

  delete(query: string | Partial<T>) {
    return new Promise<DocType<T> | null>((resolve, reject) => {
      const options = { new: true };

      const q =
        typeof query === 'object'
          ? this.model.findOneAndDelete(query, options)
          : this.model.findByIdAndDelete(query, options);

      q.lean()
        .then((r) => {
          if (!r) {
            resolve(null);
          }

          if (this.useRedis) {
            const key =
              typeof query === 'object'
                ? JSON.stringify({
                    ...query,
                    collection: this.model.name,
                  })
                : query;
            this.cacheClient?.invalidateCache(key);
          }

          resolve(<DocType<T>>r);
        })
        .catch((e) => {
          reject(e);
        });
    });
  }

  count(query: Partial<DocType<T>> = {}) {
    return this.model.countDocuments(query);
  }

  optionsParser<Q extends Query<any, any>>(q: Q, options: OptionsParser<T>): Q {
    if (options.sort) {
      q.sort(<Record<Partial<keyof DocType<T>>, 1 | -1>>options.sort);
    }

    if (options.limit) {
      q.limit(options.limit);
    }

    if (options.skip) {
      q.skip(options.skip);
    }

    if (options.projection && options.projection.length > 0) {
      q.projection(options.projection.join(' '));
    }

    if (options.populate) {
      Array.isArray(options.populate) ? q.populate(options.populate.join(' ')) : q.populate(options.populate);
    }

    if (options.multiPopulate) {
      for (const p of options.multiPopulate) {
        q.populate(p);
      }
    }

    if (options.and && options.and.length > 0) {
      q.and(options.and);
    }

    if (options.or && options.or.length > 0) {
      q.or(options.or);
    }

    if (options.in) {
      q.where(<string>options.in.query).in(options.in.in);
    }

    if (options.all) {
      q.where(options.all.query).all(options.all.all);
    }

    return q;
  }

  handleLoad(data: UpdateData<T>) {
    if (data.load) {
      const push = data.load.toSet ? '$addToSet' : '$push';
      const _key = data.load.key;

      if (Array.isArray(data.load.value)) {
        Object.assign(data, {
          [push]: {
            [_key]: {
              $each: data.load.value,
            },
          },
        });
      } else {
        Object.assign(data, {
          [push]: {
            [_key]: data.load.value,
          },
        });
      }

      delete data.load;
    }

    return this;
  }

  handleUnload(data: UpdateData<T>) {
    if (data.unload) {
      const _key = data.unload.key;
      const _field = data.unload.field || '_id';

      if (Array.isArray(data.unload.value)) {
        Object.assign(data, {
          $pull: {
            [_key]: {
              [_field]: { $in: data.unload.value },
            },
          },
        });
      } else {
        Object.assign(data, {
          $pull: _key
            ? {
                [_key]: {
                  [_field]: data.unload.value,
                },
              }
            : {
                [_field]: data.unload.value,
              },
        });
      }

      delete data.unload;
    }
    return this;
  }

  handleIncrement(data: UpdateData<T>) {
    if (data.increment) {
      const _key = data.increment.key;

      Object.assign(data, {
        $inc: {
          [_key]: data.increment.value,
        },
      });

      delete data.increment;
    }
    return this;
  }

  custom() {
    return this.model;
  }

  get RepositorySession() {
    return startSession;
  }
}
