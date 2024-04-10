from django.http import HttpResponse
from django.views.decorators.http import require_http_methods

from counterfactual.models.factory import CounterfactualFactory, DICE

import dice_ml
from dice_ml.utils import helpers # helper functions
from sklearn.model_selection import train_test_split

@require_http_methods(["GET"])
def gen_counterfactual(request):
    """
    Get counterfactuals
    """

    gen_type = request.GET.get('type', DICE)
    factory = CounterfactualFactory()

    try:
        gen = factory.create_counterfactual(gen_type)
    except ValueError:
        return HttpResponse("Invalid generator type", status=400)

    json = gen.get_counterfactuals()
    return HttpResponse(json, content_type='application/json')