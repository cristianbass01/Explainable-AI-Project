# Generate counterfactual
curl --request POST \
  --url http://localhost:8000/counterfactual/ \
  --header 'Content-Type: application/json' \
  --header 'User-Agent: insomnia/8.6.1' \
  --cookie csrftoken=o4qK7gzrfmNWXYoe6Uf8U3cuXJopt98J \
  --data '{
	"query": { 
		"age": 29,
		"workclass": "Private",
		"education": "HS-grad",
		"marital_status": "Married",
		"occupation": "Blue-Collar",
		"race": "White",
		"gender": "Female",
		"hours_per_week": 381
	},
	"featuresToVary": ["hours_per_week"], # optional
	"modelName": "adult_income",
	"dataset": "adult_income",
	"type": "DICE",
	"count": 2 # optional
}'

# Upload file
curl --request POST \
  --url http://localhost:8000/upload/ \
  --header 'Content-Type: multipart/form-data' \
  --header 'User-Agent: insomnia/8.6.1' \
  --cookie csrftoken=o4qK7gzrfmNWXYoe6Uf8U3cuXJopt98J \
  --form 'file=@/home/nikolay/Downloads/David W. Hosmer - Applied Logistic Regression - 3rd Edition.pdf' \
  --form title=testing5 \
  --form modelType=TF

# Get models
curl --request GET \
  --url http://localhost:8000/models/ \
  --header 'User-Agent: insomnia/8.6.1' \
  --cookie csrftoken=o4qK7gzrfmNWXYoe6Uf8U3cuXJopt98J


# Upload datasets
curl --request POST \
  --url http://localhost:8000/uploadDataset/ \
  --header 'Content-Type: multipart/form-data' \
  --header 'User-Agent: insomnia/8.6.1' \
  --cookie csrftoken=o4qK7gzrfmNWXYoe6Uf8U3cuXJopt98J \
  --form file=@/home/nikolay/EMAI/Ljublajna/Explainable-AI-Project/user_study_dataset/models/data.csv \
  --form title=diabetes \
  --form type=csv \
  --form target=diabetes