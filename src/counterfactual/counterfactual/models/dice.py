from django.db import models
import dice_ml
from dice_ml.utils import helpers # helper functions
from sklearn.model_selection import train_test_split
import numpy as np

class DiceGenerator(models.Model):
    def __init__(self, model,dataset):
        super().__init__()
        target_name = dataset.get_target()
        continuous_features = dataset.get_con_feat()
        dataset = dataset.get_dataset()
        target = dataset[target_name]
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

        m = dice_ml.Model(model = model.get_model(),
                          backend = model.get_type(), func=func)

        self.gen = dice_ml.Dice(d,m)
    
    def get_counterfactuals(self, query_instance = None, features_to_vary = "all", count = 1):
        cfs = self.gen.generate_counterfactuals(query_instance, total_CFs=count, desired_class="opposite", features_to_vary=features_to_vary)
        return cfs.cf_examples_list[0].final_cfs_df.to_json(orient='records')

    