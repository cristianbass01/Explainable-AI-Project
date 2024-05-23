import pandas as pd
import numpy as np
from typing import List
from .datasetManager import Dataset

class CounterfactualBinner:
    def __init__(self, dataset: Dataset):
        self.data = dataset.get_dataset()
        self.columns = dataset.get_con_feat()
        self.data_stats = self._compute_data_stats()

    def _compute_data_stats(self) -> pd.DataFrame:
        return self.data[self.columns].describe().loc[['min', 'max']]

    def bin(self, counterfactual: pd.DataFrame, query_instance: pd.Series) -> pd.DataFrame:
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