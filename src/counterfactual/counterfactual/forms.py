from django import forms
from django.core.exceptions import ValidationError


class UploadFileForm(forms.Form):
    title = forms.CharField(max_length=50)
    modelType = forms.CharField(max_length=50)
    file = forms.FileField()

    def clean_modelType(self):
        modelType = self.cleaned_data.get('modelType')
        if modelType not in ['TF', 'TF2', 'PT', 'SK']:
            raise ValidationError("Invalid model type. Expected 'TF', 'TF2', 'PT', or 'SK'.")
        return modelType