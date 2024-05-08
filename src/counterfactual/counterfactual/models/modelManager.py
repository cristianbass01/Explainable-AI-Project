from typing import Iterable
from django.db import models
import os
from dice_ml.utils import helpers # helper functions
from sklearn.model_selection import train_test_split
import tensorflow as tf
import torch
import pickle
import dice_ml


BASE_PATH = "./src/counterfactual/counterfactual/uploads"

# In memory simulation of db that keeps info on model paths

modelDB = {
    "adult_income": {
        "path": dice_ml.utils.helpers.get_adult_income_modelpath(),
        "type": "TF2"
    }
}

class Model:
    def __init__(self, modelPath, modelType) -> None:
        if modelType == "TF" or "TF2":
            model = tf.keras.models.load_model(modelPath)
        elif modelType == "PT":
            model = torch.load(modelPath)
        elif modelType == "SK":
            with open(modelPath, 'rb') as f:
                model = pickle.load(f)
        else:
            raise ValueError("Invalid model type")

        self.model = model
        self.type = modelType
    
    def get_model(self):
        return self.model
    
    def get_type(self):
        return self.type

class ModelManager(models.Model):
    def get_model(self, title):
        if title not in modelDB:
            raise ValueError("Model name not found")

        modelMetadata = modelDB[title]
        modelPath = modelMetadata['path']
        modelType = modelMetadata['type']

        return Model(
            modelPath,
            modelType
        )


    def get_models(self):
        modelDB_copy = [{"title": title,
                        "type": model['type']} for title, model in modelDB.items()]

        return { "models": modelDB_copy }
    
    def save_model(self, title, modelType, file):
        extension = os.path.splitext(file.name)[1]
        path = "{:}/{:}{:}".format(BASE_PATH, title, extension)
        with open(path, "wb+") as destination:
            for chunk in file.chunks():
                destination.write(chunk)
        
        modelDB[title] = {
            "path": path,
            "type": modelType
        }
