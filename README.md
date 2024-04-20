AITC-Server
====================
Welcome to the AITC-Server repository. This project is an express app for real estate transaction management. It leverages several APIs including OpenAI & Upstage for document comprehension.

To Do
---------------
- [ ] Fix validation route
- [ ] Create extract-details route

Getting Started
---------------
To get started with this project, clone the repository to your local machine:

```
git clone https://github.com/lodrixoll/AITC-Server.git

```


### Installation

Install the necessary dependencies by running:

```
npm install

```


### Environment

You need to set several API secrets to run the application. Create an env by copying the example file.

```
cp .env.example .env
```


### Running the Application

To start the application in development mode, run:

```
npm run dev

```

This will launch the application on <http://localhost:3001>. You can send test requests using thunder client or you can run the frontend locally and view it on your browser.


### Deployment

Heroku

```
To do

```


Project Structure
-----------------

* `server.js`: The main entrypoint for the application.
* `models/`: Database models.
* `pdfs/`: Contains a single sample purchase agreement.
* `routes/`: Route handlers.
* `uploads/`: Where the uploaded PDFs are stored.
* `validation/`: HTML files used for validating the Purchase Agreement.

