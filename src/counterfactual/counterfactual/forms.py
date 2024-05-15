from django import forms
from django.core.exceptions import ValidationError

def validate_type(modelType, valid_types):
    if modelType not in valid_types:
        raise ValidationError(f"Invalid model type. Expected one of {valid_types}")
    return modelType

class UploadFileForm(forms.Form):
    title = forms.CharField(max_length=50)
    type = forms.CharField(max_length=50)
    file = forms.FileField()

    def clean_type(self):
        modelType = self.cleaned_data.get('type')
        return validate_type(modelType, ['TF', 'TF2', 'PT', 'SK'])

class UploadDatasetForm(forms.Form):
    title = forms.CharField(max_length=50)
    type = forms.CharField(max_length=50)
    file = forms.FileField()

    def clean_type(self):
        datasetType = self.cleaned_data.get('type')
        return validate_type(datasetType, ['csv'])