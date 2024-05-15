import os
import torch
import tensorflow as tf
import pickle
import pandas as pd

BASE_PATH = "./src/counterfactual/counterfactual/uploads"

class FileManager:
    def save_file(self, title, file):
        extension = os.path.splitext(file.name)[1]
        path = "{:}/{:}{:}".format(BASE_PATH, title, extension)
        with open(path, "wb+") as destination:
            for chunk in file.chunks():
                destination.write(chunk)
        
        return path
    
    def load_dataset(self, path, type):
        if type == "csv":
            dataset = pd.read_csv(path)
        else:
            raise ValueError("Not implemented yet")
        return dataset

    def load_model(self, modelPath, modelType):
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