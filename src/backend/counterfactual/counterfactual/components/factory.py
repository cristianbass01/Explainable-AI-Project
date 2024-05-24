from counterfactual.components.dice import DiceGenerator

DICE = "dice"

class CounterfactualFactory:
    def create_counterfactual(self, type, model, dataset):
        if type.lower() == DICE:
            return DiceGenerator(model, dataset)
        else:
            raise ValueError("Invalid type")