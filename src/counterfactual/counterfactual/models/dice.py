from django.db import models
import dice_ml
from dice_ml.utils import helpers # helper functions
from sklearn.model_selection import train_test_split

class DiceGenerator(models.Model):
    def __init__(self, model):
        super().__init__()
        dataset = helpers.load_adult_income_dataset()
        target = dataset["income"] # outcome variable
        train_dataset, test_dataset, _, _ = train_test_split(dataset,
                                                             target,
                                                             test_size=0.2,
                                                             random_state=0,
                                                             stratify=target)
        d = dice_ml.Data(dataframe=train_dataset,
                         continuous_features=['age', 'hours_per_week'],
                         outcome_name='income')

        m = dice_ml.Model(model = model.get_model(),
                          backend = model.get_type(), func="ohe-min-max")

        self.gen = dice_ml.Dice(d,m)
        # TODO: remove. For now just used for testing
        self.test_sample = test_dataset.drop(columns="income")[0:1]
    
    def get_counterfactuals(self, query_instance = None, features_to_vary = "all", count = 1):
        if query_instance is None:
            query_instance = self.test_sample
        cfs = self.gen.generate_counterfactuals(query_instance, total_CFs=count, desired_class="opposite", features_to_vary=features_to_vary)
        return cfs.cf_examples_list[0].final_cfs_df.to_json(orient='records')

    