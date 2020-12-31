"use strict";

import addModelFactory from "./add-model";
import editModelFactory from "./edit-model";
import listModelsFactory from "./list-models";
import findModelFactory from "./find-model";
import removeModelFactory from "./remove-model";
import handleEvents from "./handle-events";
import DataSourceFactory from "../datasources";
import ObserverFactory from "../lib/observer";
import ModelFactory from "../models";
import loadModels from "./load-models";

handleEvents(ObserverFactory.getInstance());

/**
 *
 * @param {import('../models').ModelSpecification} model
 */
function buildOptions(model) {
  const observer = ObserverFactory.getInstance();
  return {
    modelName: model.modelName,
    models: ModelFactory,
    observer: observer,
    handlers: model.eventHandlers,
    repository: DataSourceFactory.getDataSource(
      model.modelName,
      model.serializers,
      loadModels(ModelFactory, observer)
    )
  };
}

function make(factory) {
  const models = ModelFactory.getRemoteModels();
  return models.map((model) => ({
    endpoint: model.endpoint,
    fn: factory(buildOptions(model)),
  }));
}

export const addModels = () => make(addModelFactory);
export const editModels = () => make(editModelFactory);
export const listModels = () => make(listModelsFactory);
export const findModels = () => make(findModelFactory);
export const removeModels = () => make(removeModelFactory);
export const getModelId = (model) => ModelFactory.getModelId(model);
