from . import dice

DICE = "dice"

class CounterfactualFactory:
    def create_counterfactual(self, type):
        if type == DICE:
            return dice.DiceGenerator()
        else:
            raise ValueError("Invalid type")