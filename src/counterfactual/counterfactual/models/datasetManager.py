from dice_ml.utils import helpers # helper functions
from typing import Iterable
from django.db import models
from dice_ml.utils import helpers # helper functions
from sklearn.model_selection import train_test_split
import dice_ml
from counterfactual.models.fileManager import FileManager
import pandas as pd

# In memory simulation of db that keeps info on model paths
datasetDB = {
    "adult_income": {
        "path": dice_ml.utils.helpers.get_adult_income_modelpath(),
        "target": "income",
        "type": "csv",
        "columns": {
            'age': {'type': 'numeric'},
            'workclass': {'type': 'categorical',
             'values': ['Private', 'Self-Employed', 'Other/Unknown', 'Government']},
            'education': {'type': 'categorical',
             'values': ['Bachelors',
              'Assoc',
              'Some-college',
              'School',
              'HS-grad',
              'Masters',
              'Prof-school',
              'Doctorate']},
            'marital_status': {'type': 'categorical',
             'values': ['Single', 'Married', 'Divorced', 'Widowed', 'Separated']},
            'occupation': {'type': 'categorical',
             'values': ['White-Collar',
              'Professional',
              'Service',
              'Blue-Collar',
              'Other/Unknown',
              'Sales']},
            'race': {'type': 'categorical', 'values': ['White', 'Other']},
            'gender': {'type': 'categorical', 'values': ['Female', 'Male']},
            'hours_per_week': {'type': 'numeric'},
            'income': {'type': 'categorical', 'values': [False, True]}
        },
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
        dataset_metadata = [{
                        "title": title,
                        "type": dataset['type'],
                        "columns": dataset['columns'],
                        "target": dataset['type']
                    } for title, dataset in datasetDB.items()]

        return { "datasets": dataset_metadata }

    def get_column_values(self, df, col):
        if sorted(df[col].unique().tolist()) == [0, 1]:
            return {'values': df[col].map({0: False, 1: True}).unique().tolist()}
        elif df[col].nunique() < 12:
            return {'values': df[col].unique().tolist()}
        else:
            return {}

    def get_column_metadata(self, df):
        return {
                col: {
                    'type': "categorical" if df[col].nunique() < 12 else "numeric",
                    **(self.get_column_values(df, col))
                } for col in df.columns
            }
    
    def save_dataset(self, title, datasetType, file, target):
        path = self.FileManager.save_file(title, file)

        columns = None
        if datasetType == "csv":
            df = pd.read_csv(path)
            columns = self.get_column_metadata(df)
        
        datasetDB[title] = {
            "path": path,
            "type": datasetType,
            "target": target,
            "columns": columns
        }
