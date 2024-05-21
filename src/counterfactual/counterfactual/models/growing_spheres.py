from sklearn.model_selection import train_test_split
from carla import MLModelCatalog
from carla.data.catalog import OnlineCatalog
from carla.recourse_methods import GrowingSpheres
import numpy as np
import pandas as pd
import json

class GSGenerator():
    def __init__(self, model, dataset):
        super().__init__()
        self.target_name = dataset.get_target()

        data_name = dataset.get_title()
        dataset = OnlineCatalog(data_name)
        model = MLModelCatalog(dataset, "ann")

        self.gen = GrowingSpheres(model)
    
    def add_probabilities(self, df, original_prob):
        res = self.model.predict(df)
        data = json.loads(json_str)
        for i, item in enumerate(df):
            item['probability'] = np.max(res[i][0])
            item['original_probability'] = original_prob

        json_str = json.dumps(data)

        return json_str
    
    def get_counterfactuals(self, query_instance = None, features_to_vary = "all", count = 1):
        original_prob = self.model.predict(query_instance)[0][0]
        cfs = self.gen.get_counterfactuals(query_instance, original_prob)
        self.add_probabilities(cfs, original_prob)
        json_str = cfs.to_json(orient='records')

        return json_str