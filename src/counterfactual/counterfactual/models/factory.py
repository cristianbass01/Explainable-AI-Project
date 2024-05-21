from . import dice
from . import growing_spheres

DICE = "dice"
GS = "gs"

class CounterfactualFactory:
    def create_counterfactual(self, type, model, dataset):
        if type.lower() == DICE:
            return dice.DiceGenerator(model, dataset)
        if type.lower() == GS:
            return growing_spheres.GSGenerator(model, dataset)
        else:
            raise ValueError("Invalid type")