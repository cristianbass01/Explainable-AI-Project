import os
import torch
import tensorflow as tf
import pickle
import pandas as pd
from typing import IO

BASE_PATH = "./src/counterfactual/counterfactual/uploads"

class FileManager:
    """
    Handles file operations such as saving and loading files.

    This class is used to abstract the details of file handling, including where files are stored 
    (in the `BASE_PATH` directory), and how different types of files (such as TensorFlow models, 
    PyTorch models, and CSV files) are loaded.
    """

    def save_file(self, title: str, file: IO) -> str:
        """
        Saves a file to the uploads directory with the given title as the filename.

        Args:
            title (str): The title to use as the filename. The file's original extension is preserved.
            file (IO): The file-like object to save. This should be an uploaded file object, which has
                       a `chunks` method for reading the file data.

        Returns:
            str: The path where the file was saved.

        Raises:
            OSError: If there was a problem creating the directory or saving the file.
        """
        split = os.path.splitext(file.name)
        extension = ""

        if len(split) > 1:
            extension = split[1]

        path = "{:}/{:}{:}".format(BASE_PATH, title, extension)
        if not os.path.exists(BASE_PATH):
            os.mkdir(BASE_PATH)
        with open(path, "wb+") as destination:
            for chunk in file.chunks():
                destination.write(chunk)
        
        return path
    
    def load_dataset(self, path: str, type: str) -> pd.DataFrame:
        """
        Loads a dataset from a file.

        Args:
            path (str): The path to the file.
            type (str): The type of the file. Currently, only "csv" is supported.

        Returns:
            pd.DataFrame: The loaded dataset.

        Raises:
            ValueError: If `type` is not "csv".
        """
        if type == "csv":
            dataset = pd.read_csv(path)
        else:
            raise ValueError("Not implemented yet")
        return dataset

    def load_model(self, modelPath: str, modelType: str) -> object:
        """
        Loads a machine learning model from a file.

        Args:
            modelPath (str): The path to the file containing the model.
            modelType (str): The type of the model. This should be one of the following: "TF", "TF2", "PT", "sklearn".

        Returns:
            object: The loaded model. The type of this object depends on the model type.

        Raises:
            ValueError: If `modelType` is not one of the supported types.
        """
        if modelType == "TF" or modelType == "TF2":
            model = tf.keras.models.load_model(modelPath)
        elif modelType == "PT":
            model = torch.load(modelPath)
        elif modelType == "sklearn":
            with open(modelPath, 'rb') as f:
                model = pickle.load(f)
        else:
            raise ValueError("Invalid model type")
        
        return model