from abc import ABC, abstractmethod
import pandas as pd
from typing import Tuple

class AbstractCounterfactualGenerator(ABC):
    """
    An abstract base class for counterfactual generators.

    Methods:
        get_counterfactuals(query_instance: pd.DataFrame = None, features_to_vary: str = "all", count: int = 1) -> Tuple[pd.DataFrame, pd.DataFrame]:
            Generates counterfactual explanations for a given query instance.
    """

    @abstractmethod
    def get_counterfactuals(self, query_instance: pd.DataFrame = None, features_to_vary: str = "all", count: int = 1) -> Tuple[pd.DataFrame, pd.DataFrame]:
            """
            Generates counterfactual instances for a given query instance.

            Args:
                query_instance (pd.DataFrame, optional): The query instance for which counterfactuals are generated. Defaults to None.
                features_to_vary (str, optional): The features to vary in the counterfactual generation process. Defaults to "all".
                count (int, optional): The number of counterfactual instances to generate. Defaults to 1.

            Returns:
                Tuple[pd.DataFrame, pd.DataFrame]: A tuple containing the counterfactual instances and the original query instance classified with probabilities.
            """
            pass
