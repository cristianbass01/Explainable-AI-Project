import pandas as pd
import numpy as np
from typing import List    
from .datasetManager import Dataset


class GlobalBinner:
    """
    A class that performs binning of query instances based on pre-computed bin edges.

    Attributes:
    - data (pd.DataFrame): The dataset used for computing bin edges.
    - columns (list): The list of column names used for binning.
    - bin_edges (pd.DataFrame): The computed bin edges for each column.

    Methods:
    - __init__(self, dataset: Dataset): Initializes the GlobalBinner object.
    - _compute_bin_edges(self) -> pd.DataFrame: Computes the bin edges based on the dataset.
    - bin(self, instance: pd.Series) -> pd.Series: Bins a query instance into 'Low', 'Mid', or 'High' ranges.
    - bin_with_values(self, instance: pd.Series) -> pd.Series: Bins a query instance and includes the original values.
    """
    
    def __init__(self, dataset: Dataset):
        self.data = dataset.get_dataset()
        self.columns = dataset.get_con_feat()
        self.bin_edges = self._compute_bin_edges()

    def _compute_bin_edges(self) -> pd.DataFrame:
        quantiles = self.data[self.columns].quantile([0.33, 0.67])
        return quantiles

    def bin(self, instance: pd.Series) -> pd.Series:
            """
            Bins the values of the given instance in Low, Mid or High categories
            based on bin edges.

            Parameters:
            instance (pd.Series): The instance to be binned.

            Returns:
            pd.Series: The binned instance.
            """
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
        """
        Bins the values of the given instance in Low, Mid or High categories
        based on bin edges and preserves original values likse so category(original_value)

        Parameters:
        instance (pd.Series): The instance to be binned.

        Returns:
        pd.Series: The binned instance.
        """
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