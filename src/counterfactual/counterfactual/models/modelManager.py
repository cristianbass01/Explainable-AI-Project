from typing import Iterable
from django.db import models
from dice_ml.utils import helpers # helper functions
from sklearn.model_selection import train_test_split
import dice_ml
from counterfactual.models.fileManager import FileManager

# In memory simulation of db that keeps info on model paths
modelDB = {
    "adult_income": {
        "path": dice_ml.utils.helpers.get_adult_income_modelpath(),
        "type": "TF2"
    }
}

class Model:
    def __init__(self, title, model, modelType) -> None:
        self.title = title
        self.model = model
        self.type = modelType
    
    def get_title(self):
        return self.title

    def get_model(self):
        return self.model
    
    def get_type(self):
        return self.type

class ModelManager(models.Model):
    def __init__(self) -> None:
        super().__init__()
        self.FileManager = FileManager()

    def get_model(self, title):
        if title not in modelDB:
            raise ValueError("Model name not found")

        modelMetadata = modelDB[title]
        modelPath = modelMetadata['path']
        modelType = modelMetadata['type']

        model = self.FileManager.load_model(modelPath, modelType)

        return Model(
            title,
            model,
            modelType
        )

    def get_models(self):
        modelDB_copy = [{"title": title,
                        "type": model['type']} for title, model in modelDB.items()]

        return { "models": modelDB_copy }
    
    def save_model(self, title, modelType, file):
        path = self.FileManager.save_file(title, file)
        
        modelDB[title] = {
            "path": path,
            "type": modelType
        }
