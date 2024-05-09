from . import dice

DICE = "dice"

class CounterfactualFactory:
    def create_counterfactual(self, type, model, dataset):
        if type.lower() == DICE:
            return dice.DiceGenerator(model, dataset)
        else:
            raise ValueError("Invalid type")