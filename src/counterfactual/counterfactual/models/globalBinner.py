import pandas as pd
import numpy as np
from typing import List    
from .datasetManager import Dataset


class GlobalBinner:
    def __init__(self, dataset: Dataset):
        self.data = dataset.get_dataset()
        self.columns = dataset.get_con_feat()
        self.bin_edges = self._compute_bin_edges()

    def _compute_bin_edges(self) -> pd.DataFrame:
        """Calculates the 33rd and 67th percentiles for binning."""
        quantiles = self.data[self.columns].quantile([0.33, 0.67])
        return quantiles

    def bin(self, instance: pd.Series) -> pd.Series:
        """Bins a query instance into 'Low', 'Mid', or 'High' ranges."""
        binned_instance = instance.copy()
        for col in self.columns:
            low_edge, high_edge = self.bin_edges[col]
            value = instance[col].values[0]
            if value <= low_edge:
                binned_instance[col] = "Low"
            elif value <= high_edge:
                binned_instance[col] = "Mid"
            else:
                binned_instance[col] = "High"
        return binned_instance

    def bin_with_values(self, instance: pd.Series) -> pd.Series:
        """Bins a query instance and includes the original values.""" 
        binned_instance = instance.copy()
        for col in self.columns:
            low_edge, high_edge = self.bin_edges[col]
            value = instance[col].values[0]
            if value <= low_edge:
                binned_instance[col] = f"Low({value})"
            elif value <= high_edge:
                binned_instance[col] = f"Mid({value})"
            else:
                binned_instance[col] = f"High({value})"
        return binned_instance