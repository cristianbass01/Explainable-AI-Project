from django.http import HttpResponse, JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import json
from raiutils.exceptions import UserConfigValidationException
import pandas as pd
from django.core.exceptions import ValidationError

from counterfactual.models.factory import CounterfactualFactory, DICE
from counterfactual.forms import UploadFileForm
from counterfactual.models.modelManager import ModelManager

import dice_ml
from dice_ml.utils import helpers # helper functions
from sklearn.model_selection import train_test_split

# TODO: upload models and allow user to choose which model to use through a parameter
@require_http_methods(["POST"])
@csrf_exempt
def gen_counterfactual(request):
    """
    Get counterfactuals
    """
    try:
        body = json.loads(request.body)
        query = pd.DataFrame.from_dict(body['query'], orient='index').T

        gen_type = body['type']

        featuresToVary = "all"
        count = body['count']
        if "featuresToVary" in body:
            featuresToVary = body['featuresToVary']

        factory = CounterfactualFactory()

        gen = factory.create_counterfactual(gen_type)
        counerfactual = gen.get_counterfactuals(query, featuresToVary, count)

        return HttpResponse(counerfactual, content_type='application/json')
    except ValueError:
        return JsonResponse({"Invalid generator type"}, status=400)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except UserConfigValidationException:
        return HttpResponse("Counterfactuals not found", status=404)


@require_http_methods(["POST"])
@csrf_exempt
def upload_file(request):
    try: 
        mm = ModelManager()
        form = UploadFileForm(request.POST, request.FILES)
        if form.is_valid():
            mm.save_model(request.POST.get('title'), request.POST.get('modelType'), request.FILES["file"])
            return HttpResponse("Success", status=200)
        else:
            if form.errors.get('modelType') is not None:
                return HttpResponse(form.errors['modelType'], status=400)
            return HttpResponse("Invalid Form", status=400)
    except Exception as e:
        return HttpResponse("Internal Server Error", status=500)


@require_http_methods(["GET"])
def get_models(request):
    return JsonResponse(ModelManager().get_models(), status=200)