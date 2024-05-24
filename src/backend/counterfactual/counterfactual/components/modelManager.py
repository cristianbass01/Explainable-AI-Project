from typing import Iterable
from django.db import models
from dice_ml.utils import helpers # helper functions
from sklearn.model_selection import train_test_split
from counterfactual.components.fileManager import FileManager
from typing import IO, List

# In memory simulation of db that keeps info on model paths
PATH = "path"
TYPE = "type"
TITLE = "title"

modelDB = {
    "adult_income": {
        PATH: helpers.get_adult_income_modelpath(),
        TYPE: "TF2"
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
    """
    A class that manages models in the system.
    """

    def __init__(self) -> None:
        super().__init__()
        self._fileManager = FileManager()

    def get_model(self, title: str) -> Model:
        """
        Retrieves a model by its title.

        Args:
            title (str): The title of the model.

        Returns:
            Model: The model object.

        Raises:
            ValueError: If the model name is not found.
        """
        if title not in modelDB:
            raise ValueError("Model name not found")

        modelMetadata = modelDB[title]
        modelPath = modelMetadata[PATH]
        modelType = modelMetadata[TYPE]

        model = self._fileManager.load_model(modelPath, modelType)

        return Model(
            title,
            model,
            modelType
        )

    def get_models(self) -> dict:
        """
        Retrieves all models metadata.

        Returns:
            dict: A dictionary containing the models' titles and types.
        """
        modelDB_copy = [{TITLE: title,
                        TYPE: model[TYPE]} for title, model in modelDB.items()]

        return { "models": modelDB_copy }
    
    def save_model(self, title: str, modelType: str, file: IO) -> None:
        """
        Saves a model to the system.

        Args:
            title (str): The title of the model.
            modelType (str): The type of the model.
            file: The file containing the model.

        Returns:
            None
        """
        path = self._fileManager.save_file(title, file)
        
        modelDB[title] = {
            PATH: path,
            TYPE: modelType
        }
