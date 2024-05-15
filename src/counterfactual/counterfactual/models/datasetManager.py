from dice_ml.utils import helpers # helper functions
from typing import Iterable
from django.db import models
from dice_ml.utils import helpers # helper functions
from sklearn.model_selection import train_test_split
import dice_ml
from counterfactual.models.fileManager import FileManager

# In memory simulation of db that keeps info on model paths
datasetDB = {
    "adult_income": {
        "path": dice_ml.utils.helpers.get_adult_income_modelpath(),
        "target": "income",
        "type": "csv"
    }
}

class Dataset:
    def __init__(self, dataset, target) -> None:
        self.dataset = dataset
        self.target = target
        self.continuous_features = dataset.select_dtypes(include=['float64', "int64"]).columns.tolist()
        self.continuous_features = [col for col in self.continuous_features if col != target]

    
    def get_dataset(self):
        return self.dataset

    def get_con_feat(self):
        return self.continuous_features
    
    def get_target(self):
        return self.target

class DatasetManager:
    def __init__(self) -> None:
        super().__init__()
        self.FileManager = FileManager()

    def get_dataset(self, title):
        if title not in datasetDB:
            raise ValueError("Dataset name not found")

        if title == "adult_income":
            dataset = helpers.load_adult_income_dataset()
            return Dataset(
                dataset,
                datasetDB[title]['target']
            )

        datasetMetadata = datasetDB[title]
        datasetPath = datasetMetadata['path']
        datasetType = datasetMetadata['type']
        datasetTarget = datasetMetadata['target']

        dataset = self.FileManager.load_dataset(datasetPath, datasetType)

        return Dataset(
            dataset,
            datasetTarget
        )

    def get_datasets(self):
        dataset_metadata = [{"title": title,
                        "type": model['type']} for title, model in datasetDB.items()]

        return { "models": dataset_metadata }
    
    def save_dataset(self, title, datasetType, file, target):
        path = self.FileManager.save_file(title, file)
        
        datasetDB[title] = {
            "path": path,
            "type": datasetType,
            "target": target
        }
