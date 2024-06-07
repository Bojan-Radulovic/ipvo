# ipvo
Project made for the Infrastructure for large-scale data university course. An eCommerce full stack app with React as the frontend, a Flask API connected to multiple microservices and a MongoDB database.
## Table of contents
- [ipvo](#ipvo)
  - [Table of contents](#table-of-contents)
  - [General info](#general-info)
  - [Technologies](#technologies)
  - [Use](#use)
## General info
This project was made as a part of the Infrastructure for large-scale data university course. It's a full stack eCommerce app. The fronted of the app is built using React and it connects to a Flask API. The API sends requests to microservices via the RabbitMQ message broker and returns the results to the frontend. The app uses MongoDB and MinIO for data storage. Additionally, to make the app more scalable, a load balancer is used for distributing incoming requests to multiple instances of the app's components.
## Technologies
* Python 3.9.5
* Docker
* Flask
* React
* RabbitMQ
* MongoDB
* ...
## Use
To successfully initiate the project, it is necessary to follow these steps:
1) Clone the project from GitHub to your local machine.

2) In app-email/app-email.py, change 'app-password-for-your-gmail' to your app password for your gmail.

3) Download data and put it in app-flask folder. Download link: https://datarepo.eng.ucsd.edu/mcauley_group/data/amazon_2023/raw/meta_categories/meta_Video_Games.jsonl.gz

4) Download embeddings-description.zip and extract to app-recommender/embeddings-description. Download link: https://drive.google.com/file/d/1qWTTI0dS7yC3Skb-1m8oFn18k_6ugB2k/view?usp=sharing

5) Download embeddings-name.zip and extract to app-recommender/embeddings-name. Download link: https://drive.google.com/file/d/1HAtLXaf1KGNl6h4zBPTMU93D8SVCi_SW/view?usp=sharing

6) Open a terminal in the project's root directory.

7) Execute the command `docker-compose up`.

8) Wait for the system to initialize.

9) Access the server using a web browser at the link http://localhost:3000.
