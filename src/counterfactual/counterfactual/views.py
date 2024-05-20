from django.http import HttpResponse, JsonResponse
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
import json
from raiutils.exceptions import UserConfigValidationException
import pandas as pd
from django.core.exceptions import ValidationError

from counterfactual.models.factory import CounterfactualFactory, DICE
from counterfactual.forms import UploadFileForm, UploadDatasetForm
from counterfactual.models.modelManager import ModelManager
from counterfactual.models.datasetManager import DatasetManager

import dice_ml
from dice_ml.utils import helpers # helper functions
from sklearn.model_selection import train_test_split

SUPPORTED_MODELS = ['DICE']

@require_http_methods(["POST"])
@csrf_exempt
def gen_counterfactual(request):
    """
    Get counterfactuals
    """
    try:
        print(request.body)
        body = json.loads(request.body)
        query = pd.DataFrame.from_dict(body['query'], orient='index').T

        gen_type = body['type']

        featuresToVary = "all"
        if "count" in body:
            count = body['count']
        else:
            count = 1

        if "featuresToVary" in body:
            featuresToVary = body['featuresToVary']
        
        modelName = body['modelName']
        mm = ModelManager()
        model = mm.get_model(modelName)

        dataset_name = body['dataset']
        dm = DatasetManager()
        dataset = dm.get_dataset(dataset_name)

        factory = CounterfactualFactory()

        gen = factory.create_counterfactual(gen_type, model, dataset)
        counerfactual = gen.get_counterfactuals(query, featuresToVary, count)

        return HttpResponse(counerfactual, content_type='application/json')
    except ValueError as e:
        print(e)
        return HttpResponse(str(e), status=400)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)
    except UserConfigValidationException:
        return HttpResponse("Counterfactuals not found", status=404)


@require_http_methods(["GET"])
def get_models(request):
    return JsonResponse(ModelManager().get_models(), status=200)


def handle_form(request, form_class, save_method):
    form = form_class(request.POST, request.FILES)
    if form.is_valid():
        save_method(request.POST.get('title'), request.POST.get('type'), request.FILES["file"])
        return HttpResponse("Success", status=200)
    else:
        if form.errors.get('type') is not None:
            return HttpResponse(form.errors['type'], status=400)
        return HttpResponse("Invalid Form", status=400)

@require_http_methods(["POST"])
@csrf_exempt
def upload_file(request):
    try: 
        return handle_form(request, UploadFileForm, ModelManager().save_model)
    except Exception as e:
        print(e)
        return HttpResponse("Internal Server Error", status=500)

@require_http_methods(["POST"])
@csrf_exempt
def upload_dataset(request):
    try: 
        save_dataset_lambda = lambda title, type, file: \
              DatasetManager().save_dataset(title, type, file, request.POST.get('target'))
        return handle_form(request, UploadDatasetForm, save_dataset_lambda)
    except Exception as e:
        print(e)
        return HttpResponse("Internal Server Error", status=500)


@require_http_methods(["GET"])
def get_datasets(request):
    return JsonResponse(DatasetManager().get_datasets(), status=200)

@require_http_methods(["GET"])
def get_generators(request):
    return JsonResponse({'supported_generators': SUPPORTED_MODELS}, status=200)