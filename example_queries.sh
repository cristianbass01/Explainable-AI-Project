curl --request POST \
  --url http://localhost:8000/counterfactual/ \
  --header 'Content-Type: application/json' \
  --header 'User-Agent: insomnia/8.6.1' \
  --cookie csrftoken=o4qK7gzrfmNWXYoe6Uf8U3cuXJopt98J \
  --data '{
	"age": 29,
	"workclass": "Private",
	"education": "HS-grad",
	"marital_status": "Married",
	"occupation": "Blue-Collar",
	"race": "White",
	"gender": "Female",
	"hours_per_week": 38
}'