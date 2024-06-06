#  <img src="https://github.com/cristianbass01/Explainable-AI-Project/blob/7d108f43e3984ea91804d6db6f3a105966083fcc/figures/logo636.png" alt="Logo" width="30" height="30"> Catterfactuals

## Visual and interactive counterfactual explanations for models on tabular data

A counterfactual explanation is a popular approach to explaining predictive models that works by answering the question: what (minimal) changes do we have to make to get a different prediction?

A fair amount of work has been done on generating counterfactual explanations, but it seems only a small part of that is on visual and interactive
explanations, both of which are typically better for the user.

In this project we'll review the related work on visual and interactive counterfactual explanations for tabular data, evaluate existing solutions, identify their advantages and flaws, potentially with a user study, and, as a final challenge, try to improve on related work.

## How to run 
#### Backend: 
1) Install requirements.txt
2) Go to src/backend/counterfactual
3) Execute "python manage.py migrate"
4) Execute "python manage.py runserver". (make sure to run from the root directory)

#### Frontend:
1) Install npm
2) Go to counterfactuals-ui directory
3) Execute "npm install"
4) Execute "npm start"

## Adding more generators 
Currently we support only DiCE. 

To add more counterfactual generation methods we require you to implement the AbstractCounterfactualGenerator class with your generation algorithm and it should work.

## UI
Here you can find a video showing how our interface works:

[![Video Title](https://i.ytimg.com/vi/V7R4bYw1who/hqdefault.jpg?sqp=-oaymwEmCOADEOgC8quKqQMa8AEB-AH-CYAC0AWKAgwIABABGBwgWShyMA8=&rs=AOn4CLD-wpxV1El1EliOdBodh0KBgl6shQ)](https://youtu.be/V7R4bYw1who)

### Advisor: prof. Erik Štrumbelj
