# Get counterfactual
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
		"hours_per_week": 38
	},
	"featuresToVary": ["hours_per_week"],
	"type": "DICE",
	"count": 4
}'

# Upload file
curl --request POST \
  --url http://localhost:8000/upload/ \
  --header 'Content-Type: multipart/form-data' \
  --header 'User-Agent: insomnia/8.6.1' \
  --cookie csrftoken=o4qK7gzrfmNWXYoe6Uf8U3cuXJopt98J \
  --form 'file=@path' \
  --form title=test