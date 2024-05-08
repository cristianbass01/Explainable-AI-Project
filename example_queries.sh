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