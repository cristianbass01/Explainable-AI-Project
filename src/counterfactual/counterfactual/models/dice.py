from django.db import models
import dice_ml
from dice_ml.utils import helpers # helper functions
from sklearn.model_selection import train_test_split
import numpy as np
import pandas as pd
import json
from counterfactual.models.counterfactualBinner import CounterfactualBinner
from counterfactual.models.globalBinner import GlobalBinner

class DiceGenerator(models.Model):
    def __init__(self, model,dataset):
        super().__init__()
        target_name = dataset.get_target()
        continuous_features = dataset.get_con_feat()

        self.gb_binner = GlobalBinner(dataset)
        self.cf_binner = CounterfactualBinner(dataset)

        dataset = dataset.get_dataset()
        target = dataset[target_name]
        self.target_name = target_name
        d = dice_ml.Data(dataframe=dataset,
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
    
    def add_probabilities(self, cf, cf_dict):
        cf.drop(columns=[self.target_name], inplace=True)
        res = self.model.predict_proba(cf)
        for idx, el in enumerate(cf_dict):
            el['probability'] = np.max(res[idx])

        return cf_dict
    
    def get_counterfactuals(self, query_instance: pd.DataFrame = None, features_to_vary: str = "all", count: int = 1) -> str:
        cfs = self.gen.generate_counterfactuals(query_instance, total_CFs=count, desired_class="opposite", features_to_vary=features_to_vary)
        cf_orig = cfs.cf_examples_list[0].final_cfs_df
        cf = self.cf_binner.bin(cf_orig, query_instance.squeeze())
        binned_query = self.gb_binner.bin_with_values(query_instance)

        binned_dict = binned_query.to_dict(orient='records')[0]
        cf_dict = cf.to_dict(orient='records')

        if self.to_add_probabilities:
            original_prob = np.max(self.model.predict_proba(query_instance)[0])
            binned_dict['probability'] = original_prob
            binned_dict[self.target_name] = self.model.predict(query_instance)[0]
            cf_dict = self.add_probabilities(cf_orig, cf_dict)

        json_str = json.dumps({'counterfactuals': cf_dict, 'original': binned_dict}, default=int)

        return json_str


    