"use strict";

import { relationType } from "./make-relations";
import { importRemoteCache } from ".";
import domainEvents from "./domain-events";

/**
 * Implement distributed object cache. Find any model
 * referenced by a relation that is not registered in
 * the model factory and listen for remote CRUD events
 * from it. On receipt of the event, import the remote
 * modules for the model and its adapters/services, if
 * they haven't been already, then rehydrate and save
 * the model instance to the cache.
 *
 * @param {{observer:Observer,getDataSource:function():DataSource}} options
 */
export default function DistributedCacheManager({
  models,
  observer,
  getDataSource,
  listen,
  notify,
}) {
  /**
   * Returns the callback run by the external event service when a message arrives.
   *
   * @param {{observer:Observer,datasource:DataSource}} param0
   * @returns {function({message}):Promise<string>}
   */
  function updateCache({ modelName, callback }) {
    return async function ({ message }) {
      const event = JSON.parse(message);

      if (!event.eventName) {
        console.warn("missing eventname", event);
        return;
      }

      console.debug("handle cache event", event.eventName);

      if (
        event.eventName ===
        models.getEventName(models.EventTypes.DELETE, modelName)
      ) {
        const datasource = getDataSource(event.modelName);
        console.debug("deleting from cache", event.modelName, event.modelId);
        return datasource.delete(event.modelId);
      }

      console.debug("check if we have the code for this object...");
      const datasource = getDataSource(modelName);

      if (!models.getModelSpec(modelName)) {
        console.debug("we don't, import it...");
        // Stream the code for the model
        await importRemoteCache(modelName);
      }

      try {
        console.debug(
          "unmarshal deserialized model",
          modelName,
          event.eventData.id
        );

        const model = models.loadModel(
          observer,
          datasource,
          event.eventData,
          modelName
        );

        await datasource.save(model.getId(), model);

        if (callback) callback();
      } catch (e) {
        console.error("distributed cache", e);
      }
    };
  }

  /**
   *
   * @param {*} param0
   */
  function searchCache({ callback }) {
    return async function ({ message }) {
      const event = JSON.parse(message);
      const eventData = event.eventData;

      // find the requested object
      const model = await relationType[eventData.relation.type](
        eventData.model,
        getDataSource(eventData.relation.modelName),
        eventData.relation
      );

      if (model) {
        console.info("found object", model.modelName, model.getId());
        //if (callback) {
        callback(model);
        //}
        return;
      }
      console.warn("no object found");
    };
  }

  /**
   * Subcribe to external CRUD events for related models.
   * Also listen for request and response events for locally
   * and remotely cached data.
   */
  function startListening() {
    const modelSpecs = models.getModelSpecs();
    const registeredModels = modelSpecs.map(m => m.modelName);
    const unregisteredModels = [
      ...new Set( // deduplicate
        modelSpecs
          .filter(m => m.relations) // only models with relations
          .map(m =>
            Object.keys(m.relations).filter(
              // filter out existing local models
              k => !registeredModels.includes(m.relations[k].modelName)
            )
          )
          .reduce((a, b) => a.concat(b))
      ),
    ];

    unregisteredModels.forEach(modelName => {
      observer.on(domainEvents.internalCacheRequest(modelName), eventData =>
        notify(domainEvents.externalCacheRequest(modelName), {
          ...eventData,
          eventName: domainEvents.externalCacheRequest(modelName),
        })
      );

      listen(
        domainEvents.externalCacheResponse(modelName),
        updateCache({
          modelName,
          callback: () =>
            observer.notify(domainEvents.internalCacheResponse(modelName)),
        })
      );

      [
        models.getEventName(models.EventTypes.UPDATE, modelName),
        models.getEventName(models.EventTypes.CREATE, modelName),
        models.getEventName(models.EventTypes.DELETE, modelName),
      ].forEach(eventName => listen(eventName, updateCache({ modelName })));
    });

    registeredModels.forEach(modelName =>
      listen(
        domainEvents.externalCacheRequest(modelName),
        searchCache({
          callback: eventData => {
            console.debug(eventData);
            return notify(
              domainEvents.externalCacheResponse(modelName),
              eventData
            );
          },
        })
      )
    );
  }

  return {
    listen: startListening,
  };
}
