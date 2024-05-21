from django.db import models
import dice_ml
from dice_ml.utils import helpers # helper functions
from sklearn.model_selection import train_test_split
import numpy as np
import pandas as pd
import json
from raiutils.exceptions import UserConfigValidationException

class DiceGenerator(models.Model):
    def __init__(self, model,dataset):
        super().__init__()
        target_name = dataset.get_target()
        continuous_features = dataset.get_con_feat()
        dataset = dataset.get_dataset()
        target = dataset[target_name]
        self.target_name = target_name
        train_dataset, test_dataset, _, _ = train_test_split(dataset,
                                                             target,
                                                             test_size=0.2,
                                                             random_state=0,
                                                             stratify=target)
        d = dice_ml.Data(dataframe=train_dataset,
                         continuous_features=continuous_features,
                         outcome_name=target_name)


        # TODO: FIX this hack
        func = None
        if model.get_title() == "adult_income":
            func="ohe-min-max"

        self.to_add_probabilities = (model.get_type() == "sklearn")
        self.model = model.get_model()

        m = dice_ml.Model(model = model.get_model(),
                          backend = model.get_type(), func=func)

        self.gen = dice_ml.Dice(d,m)
    
    def add_probabilities(self, json_str, original_prob):
        df = pd.read_json(json_str)
        df.drop(columns=[self.target_name], inplace=True)
        res = self.model.predict_proba(df)
        data = json.loads(json_str)
        for i, item in enumerate(data):
            item['probability'] = np.max(res[i])
            item['original_probability'] =  1 - original_prob

        json_str = json.dumps(data)

        return json_str
    
    def get_counterfactuals(self, query_instance = None, features_to_vary = "all", count = 1):
        cfs = self.gen.generate_counterfactuals(query_instance, total_CFs=count, desired_class="opposite", features_to_vary=features_to_vary)
        cfs_df = cfs.cf_examples_list[0].final_cfs_df

        if cfs_df is None:
            raise UserConfigValidationException("No counterfactuals found")

        json_str = cfs_df.to_json(orient='records')

        if not self.to_add_probabilities:
            return json_str

        original_prob = np.max(self.model.predict_proba(query_instance)[0])
        return self.add_probabilities(json_str, original_prob)

    