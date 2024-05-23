import pandas as pd
import numpy as np
from typing import List
from .datasetManager import Dataset

class CounterfactualBinner:
    """
    A class that performs binning of counterfactual data based on query instance.

    Args:
        dataset (Dataset): The dataset object containing the data.

    Attributes:
        data (pd.DataFrame): The dataset.
        columns (list): The list of column names.
        data_stats (pd.DataFrame): The computed data statistics.

    Methods:
        _compute_data_stats: Computes the data statistics.
        bin: Performs binning of counterfactual data.

    """

    def __init__(self, dataset: Dataset):
        self.data = dataset.get_dataset()
        self.columns = dataset.get_con_feat()
        self.data_stats = self._compute_data_stats()

    def _compute_data_stats(self) -> pd.DataFrame:
        """
        Computes the data statistics.

        Returns:
            pd.DataFrame: The computed data statistics.

        """
        return self.data[self.columns].describe().loc[['min', 'max']]

    def bin(self, counterfactual: pd.DataFrame, query_instance: pd.Series) -> pd.DataFrame:
        """
        Performs binning of each counterfactual feature into classes Lower and Higher
        based on the query instance.
        
        Args:
            counterfactual (pd.DataFrame): The counterfactual data.
            query_instance (pd.Series): The query instance.

        Returns:
            pd.DataFrame: The binned counterfactual data.

        Example:
            old_value = 0.5
            new_value = 0.7
            bin -> Higher(0.7) since the new value is higher than the old value.
        """
        binned_cf = counterfactual.copy()
        for col in self.columns:
            query_value = query_instance[col]
            cf_values = counterfactual[col]
            data_min, data_max = self.data_stats[col]
            data_range = data_max - data_min

            relative_changes = (cf_values - query_value) / data_range
            change_directions = np.where(relative_changes >= 0, 'Higher', 'Lower')

            eps = 1e-6
            binned_cf[col] = [
                f"{direction}({value})" if np.abs(change) > eps
                else f"{value}"
                for value, direction, change in zip(cf_values, change_directions, relative_changes)
            ]
        return binned_cf