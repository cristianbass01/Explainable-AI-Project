from django.db import models
import dice_ml
from dice_ml.utils import helpers # helper functions
from sklearn.model_selection import train_test_split
import numpy as np
import pandas as pd
from counterfactual.models.datasetManager import Dataset
from typing import Tuple


PROBABILITY = 'probability'

class DiceGenerator(models.Model):
    """
    A class that generates counterfactual explanations using the Diverse Counterfactuals (DiCE) algorithm.

    Args:
        model (object): The machine learning model used for generating counterfactuals.
        dataset (Dataset): The dataset used for generating counterfactuals.

    Attributes:
        _target_name (str): The name of the target variable.
        _to_add_probabilities (bool): Indicates whether to add probabilities to the counterfactuals.
        _model (object): The machine learning model used for generating counterfactuals.
        _gen (dice_ml.Dice): The DiCE object used for generating counterfactuals.

    Methods:
        _add_probabilities(cf: pd.DataFrame) -> pd.DataFrame:
            Adds probabilities of the class to the counterfactuals dataframe.
        get_counterfactuals(query_instance: pd.DataFrame = None, features_to_vary: str = "all", count: int = 1) -> Tuple[pd.DataFrame, pd.DataFrame]:
            Generates counterfactual explanations for a given query instance.

    """

    def __init__(self, model: object, dataset: Dataset) -> None:
        super().__init__()
        target_name = dataset.get_target()
        numeric_feats = dataset.get_continuous_feat()

        dataset = dataset.get_dataset()
        self._target_name = target_name
        d = dice_ml.Data(dataframe=dataset,
                         continuous_features=numeric_feats,
                         outcome_name=target_name)


        # TODO: FIX this hack
        func = None
        if model.get_title() == "adult_income":
            func="ohe-min-max"

        self._to_add_probabilities = (model.get_type() == "sklearn")
        self._model = model.get_model()

        m = dice_ml.Model(model = model.get_model(),
                          backend = model.get_type(), func=func)
        
        self._gen = dice_ml.Dice(d,m)
    
    def _add_probabilities(self, cf: pd.DataFrame) -> pd.DataFrame:
        """
        Adds probabilities of the class to the counterfactuals dataframe.

        Args:
            cf (pd.DataFrame): The counterfactuals dataframe.

        Returns:
            pd.DataFrame: The counterfactuals dataframe with added probabilities.
        """
        target_val = cf[self._target_name]

        cf.drop(columns=[self._target_name], inplace=True)
        res = self._model.predict_proba(cf)
        cf[PROBABILITY] = np.max(res, axis=1)

        cf[self._target_name] = target_val
        return cf
    
    def get_counterfactuals(self, query_instance: pd.DataFrame = None, features_to_vary: str = 'all', count: int = 1) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        Generates counterfactual explanations for a given query instance.

        Args:
            query_instance (pd.DataFrame, optional): The query instance for which counterfactuals are generated. Defaults to None.
            features_to_vary (str, optional): Specifies the features to vary during counterfactual generation. Defaults to "all".
            count (int, optional): The number of counterfactuals to generate. Defaults to 1.

        Returns:
            Tuple[pd.DataFrame, pd.DataFrame]: A tuple containing the counterfactuals and the modified query instance.
        """
        
        cfs = self._gen.generate_counterfactuals(query_instance, total_CFs=count, desired_class="opposite", features_to_vary=features_to_vary)
        counterfactuals = cfs.cf_examples_list[0].final_cfs_df

        if self._to_add_probabilities:
            original_prob = np.max(self._model.predict_proba(query_instance)[0])
            query_instance[self._target_name] = self._model.predict(query_instance)[0]
            query_instance[PROBABILITY] = original_prob
            counterfactuals = self._add_probabilities(counterfactuals)

        return counterfactuals, query_instance


    