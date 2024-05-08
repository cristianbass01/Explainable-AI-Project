from . import dice

DICE = "dice"

class CounterfactualFactory:
    def create_counterfactual(self, type, model):
        if type.lower() == DICE:
            return dice.DiceGenerator(model)
        else:
            raise ValueError("Invalid type")