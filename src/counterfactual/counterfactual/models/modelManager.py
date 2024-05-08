from typing import Iterable
from django.db import models
import os
from dice_ml.utils import helpers # helper functions
from sklearn.model_selection import train_test_split

BASE_PATH = "./src/counterfactual/counterfactual/uploads"

# In memory simulation of db that keeps info on model paths
modelDB = {}
class ModelManager(models.Model):
    def __init__(self):
        print()
    
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
