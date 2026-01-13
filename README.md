The Dynamic Poll App is a full-stack web application that allows users to create polls,
share them via unique links, and vote in real-time. Votes are displayed dynamically with colored bars,
and polls automatically close after a set duration. The app is mobile-friendly, fully responsive, and visually interactive.

Technology Stack

Frontend: HTML, CSS, JavaScript

Backend: Node.js, Express.js

Database: LowDB (JSON file)

Utilities: nanoid for unique poll IDs

Deployment: Render.com

Features

Create Polls: Input a question, multiple options,and duration in minutes.

Unique Poll Link: Shareable link to the poll page.

Voting: Clickable option bars that update votes in real-time.

Duplicate Vote Prevention: Users cannot vote twice using localStorage.

Countdown Timer: Shows remaining poll time; disables voting after expiration.

Responsive Design: Works seamlessly on mobile and desktop.

Dynamic Option Bars: Colored fill shows vote proportions; horizontal scroll for long option names on mobile.

Installation and Running Locally

1.Clone or download the repository

git clone <repository_url>

cd poll-app

2.Install dependencies

npm install

3.Start the server

node server.js

4.Open your browser and go to:

http://localhost:3000
