from dice_ml.utils import helpers # helper functions
from typing import Iterable
from django.db import models
from dice_ml.utils import helpers # helper functions
from sklearn.model_selection import train_test_split
import dice_ml
from counterfactual.components.fileManager import FileManager
import pandas as pd
from typing import IO, List
import numpy as np


PATH = "path"
TYPE = "type"
TARGET = "target"
COLUMNS = "columns"

# In memory simulation of db that keeps info on model paths
datasetDB = {
    "adult_income": {
        PATH: dice_ml.utils.helpers.get_adult_income_modelpath(),
        TARGET: "income",
        TYPE: "csv",
        COLUMNS: {
            'age': {'type': 'numeric'},
            'workclass': {'type': 'categorical',
             'values': ['Government', 'Other/Unknown', 'Private', 'Self-Employed']},
            'education': {'type': 'categorical',
             'values': ['Assoc',
              'Bachelors',
              'Doctorate',
              'HS-grad',
              'Masters',
              'Prof-school',
              'School'
              'Some-college',
              ]},
            'marital_status': {'type': 'categorical',
             'values': ['Divorced', 'Married', 'Separated', 'Single', 'Widowed']},
            'occupation': {'type': 'categorical',
             'values': [
              'Blue-Collar',
              'Other/Unknown',
              'Professional',
              'Sales',
              'Service',
              'White-Collar'
              ]},
            'race': {'type': 'categorical', 'values': ['Other', 'White']},
            'gender': {'type': 'categorical', 'values': ['Female', 'Male']},
            'hours_per_week': {'type': 'numeric'},
            'income': {'type': 'categorical', 'values': [False, True]}
        },
    }
}

class Dataset:
    """
    Represents a dataset for machine learning.

    This class holds a pandas DataFrame and provides methods to access various properties of the dataset, 
    such as the numeric features, continuous features, and target feature.

    Attributes:
        dataset (pd.DataFrame): The dataset.
        target (str): The name of the target feature.
        numeric (List[str]): The names of the numeric features.
        continuous_features (List[str]): The names of the continuous features.
    """
    def __init__(self, dataset: pd.DataFrame, target: str) -> None:
        self.dataset = dataset
        self.target = target
        self.numeric = dataset.select_dtypes(include=['float64', 'int64']).columns.tolist()
        self.numeric = [col for col in self.numeric if col != target]
        self.continuous_features = [col for col in dataset.columns 
                                   if dataset[col].nunique() > 10 and col != target]
        
        self.cat_features = [col for col in dataset.columns if col not in self.continuous_features and col != target]
        self.possbile_bool_features = [col for col in self.cat_features if dataset[col].nunique() == 2]


    def get_categorical_feat(self) -> List[str]:
        return self.cat_features

    def get_dataset(self) -> str:
        return self.dataset

    def get_numeric_feat(self) -> List[str]:
        return self.numeric

    def get_continuous_feat(self) -> List[str]:
        return self.continuous_features
    
    def get_target(self) -> str:
        return self.target
    
    def convert_features_to_bool(self, input: pd.DataFrame) -> str:
        for col in self.possbile_bool_features:
            input[col] = input[col].replace({1: True, 0: False})
        return input
    
    def sample(self, n: int) -> pd.DataFrame:
        sample = self.dataset.sample(n)
        sample = self.convert_features_to_bool(sample)
        return sample

class DatasetManager:
    """
    The DatasetManager class is responsible for managing datasets.

    It provides methods to retrieve datasets, get metadata for all datasets,
    retrieve unique values of columns in a DataFrame, retrieve metadata for
    columns in a DataFrame, and save datasets to files.

    Attributes:
        FileManager (FileManager): An instance of the FileManager class.

    Methods:
        get_dataset(title: str) -> Dataset:
            Retrieves a dataset by its title.

        get_datasets() -> dict:
            Returns metadata for all datasets.

        _get_column_values(df: pd.DataFrame, col: str) -> dict:
            Retrieves the unique values of a column in a DataFrame.

        _get_column_metadata(df: pd.DataFrame) -> dict:
            Retrieves metadata for all columns in a DataFrame.

        save_dataset(title: str, datasetType: str, file: IO, target: str) -> None:
            Saves a dataset to a file and adds it to the datasetDB dictionary.
    """

    def __init__(self) -> None:
        super().__init__()
        self.FileManager = FileManager()

    def get_dataset(self, title: str) -> Dataset:
        """
        Retrieves a dataset by its title.

        It loads the dataset from a file using the FileManager. 
        The details of the dataset, such as its file path and type,
        are retrieved from the `datasetDB` dictionary.

        Args:
            title (str): The title of the dataset.

        Returns:
            Dataset: The requested dataset.

        Raises:
            ValueError: If `title` is not found in the `datasetDB` dictionary.
        """
        if title not in datasetDB:
            raise ValueError("Dataset name not found")

        if title == "adult_income":
            dataset = helpers.load_adult_income_dataset()
            return Dataset(
                dataset,
                datasetDB[title][TARGET]
            )

        datasetMetadata = datasetDB[title]
        datasetPath = datasetMetadata[PATH]
        datasetType = datasetMetadata[TYPE]
        datasetTarget = datasetMetadata[TARGET]

        dataset = self.FileManager.load_dataset(datasetPath, datasetType)

        return Dataset(
            dataset,
            datasetTarget
        )

    def get_datasets(self) -> dict:
        """
        Returns metadata for all datasets in `datasetDB`.
        The path is ommited

        Returns:
            dict: Metadata for each dataset.
        """
        dataset_metadata = [{
                        "title": title,
                        TYPE: dataset[TYPE],
                        COLUMNS: dataset[COLUMNS],
                        TARGET: dataset[TARGET]
                    } for title, dataset in datasetDB.items()]

        return { "datasets": dataset_metadata }

    def _get_column_values(self, df: pd.DataFrame, col: str) -> dict:
        """
        Retrieves the unique values of a column in a DataFrame.

        If the column is binary (i.e., contains only 0 and 1), the values are mapped to False and True, respectively. 
        If the column has less than 12 unique values, all unique values are returned because we consider the feature categorical
        Otherwise, an empty dictionary is returned cause we consider the feature continuous.

        Args:
            df (pd.DataFrame): The DataFrame.
            col (str): The name of the column.

        Returns:
            dict: A dictionary containing the unique values of the column, or an empty dictionary.
        """
        if sorted(df[col].unique().tolist()) == [0, 1]:
            return {'values': np.sort(df[col].map({0: False, 1: True}).unique()).tolist()}
        elif df[col].nunique() < 12:
            return {'values': np.sort(df[col].unique()).tolist()}
        else:
            return {}

    def _get_column_metadata(self, df: pd.DataFrame) -> dict:
        """
        Retrieves metadata for all columns in a DataFrame.

        The metadata for each column includes its type (either "categorical" or "numeric") and its unique values 
        (if it's binary or has less than 12 unique values).

        Args:
            df (pd.DataFrame): The DataFrame.

        Returns:
            dict: A dictionary containing the metadata for each column.
        """
        return {
                col: {
                    'type': "categorical" if df[col].nunique() < 12 else "numeric",
                    **(self._get_column_values(df, col))
                } for col in df.columns
            }
    
    def save_dataset(self, title: str, datasetType: str, file: IO, target: str) -> None:
        """
        Saves a dataset to a file and adds it to the `datasetDB` dictionary.

        The dataset is saved using the FileManager. The path where the dataset was saved, along with the dataset's 
        title, type, and target feature, are stored in the `datasetDB` dictionary.

        Args:
            title (str): The title of the dataset.
            datasetType (str): The type of the dataset.
            file (IO): The file-like object containing the dataset.
            target (str): The name of the target feature.

        Raises:
            OSError: If there was a problem saving the file.
        """
        path = self.FileManager.save_file(title, file)

        columns = None
        if datasetType == "csv":
            df = pd.read_csv(path)
            columns = self._get_column_metadata(df)
        
        datasetDB[title] = {
            PATH: path,
            TYPE: datasetType,
            TARGET: target,
            COLUMNS: columns
        }
