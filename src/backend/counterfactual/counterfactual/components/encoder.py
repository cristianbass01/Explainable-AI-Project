from counterfactual.components.datasetManager import Dataset
from typing import Tuple
import pandas as pd

class Encoder:
    """
    The Encoder class is responsible for encoding and decoding categorical features in a dataset.
    Currently only supports numeric encoding. One Hot Encoding will be added in the future.
    """

    def __init__(self, dataset: Dataset):
        """
        Initializes the Encoder object.

        Parameters:
        - dataset (Dataset): The dataset object containing the data to be encoded.

        """
        self.categorical_features = dataset.get_categorical_feat()
        self.to_encode = dataset.get_target() == 'diabetes' or dataset.get_target() == 'Loan_Status'
        if dataset.get_target() == 'Loan_Status':
            self.categorical_features.append('Loan_Status')
            self.categorical_features.remove('Loan_Amount_Term')

        dataset = dataset.get_dataset()

        self.encoders = {}
        for feature in self.categorical_features:
            catCol = dataset[feature].astype('category')
            self.encoders[feature] = catCol.cat.categories

        

    def encode(self, data: pd.DataFrame) -> pd.DataFrame:
        """
        Encodes the categorical features in the given data.

        Parameters:
        - data (pandas.DataFrame): The data to be encoded.

        Returns:
        - encoded_data (pandas.DataFrame): The encoded data.

        """
        if not self.to_encode:
            return data

        for feature in self.categorical_features:
            if feature in data.columns:
                data[feature] = data[feature].astype('category').cat \
                    .set_categories(self.encoders[feature]).cat.codes

        return data

    def decode(self, binned_query: pd.DataFrame, cfs: pd.DataFrame) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        Decodes the categorical features in the given binned query and counterfactuals.

        Parameters:
        - binned_query (pandas.DataFrame): The binned query with encoded categorical features.
        - cfs (pandas.DataFrame): The counterfactuals with encoded categorical features.

        Returns:
        - decoded_binned_query (pandas.DataFrame): The binned query with decoded categorical features.
        - decoded_cfs (pandas.DataFrame): The counterfactuals with decoded categorical features.

        """
        if not self.to_encode:
            return binned_query, cfs

        for feature in self.categorical_features:
            if feature in binned_query.columns:
                binned_query[feature] = self.encoders[feature][binned_query[feature]]
                for i, cf in cfs.iterrows():
                    cfs.loc[i, feature] = self.encoders[feature][cf[feature]]

        return binned_query, cfs