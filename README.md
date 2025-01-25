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

2) In compose.yaml, change GMAIL_APP_PASSWORD env var to your app password for your gmail. (needed for email functionality, optional)

3) Open a terminal in the project's root directory.

4) Execute the command `docker-compose up`.

5) Wait for the system to initialize.

6) Access the server using a web browser at the link http://localhost:8080.
