# Mindly - Mental Well-being Journaling Tool

Mindly is a full-stack web application for tracking your emotional well-being through daily journaling. The app uses AI-powered sentiment analysis to detect your mood and provides beautiful visualizations to help you understand your emotional patterns over time.

## Features

- 🔐 **User Authentication**: Secure login and registration
- 📝 **Journal Entries**: Daily reflection with AI-powered sentiment analysis
- 📊 **Stunning Visualizations**: Track your mood patterns with interactive charts
- 🔥 **Streaks**: Build a journaling habit with streak tracking
- 💡 **Insights**: Get personalized observations about your emotional patterns
- 🌓 **Dark/Light Mode**: Choose your preferred theme
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Tech Stack

### Backend
- **FastAPI**: Modern, high-performance web framework
- **MongoDB**: NoSQL database for storing user data and journal entries
- **Google Gemini AI**: Advanced sentiment analysis
- **JWT Authentication**: Secure user authentication
- **Motor**: Asynchronous MongoDB driver

### Frontend
- **HTML/CSS/JS**: Clean, modern interface
- **Chart.js**: Beautiful, responsive visualizations
- **Responsive Design**: Works on desktop and mobile

## Project Structure

```
mindly/
├── backend/
│   ├── app.py                # FastAPI application (all-in-one)
│   ├── requirements.txt      # Python dependencies
│   └── .env                  # Environment variables (create this)
│
└── frontend/
    ├── index.html            # Main application page
    ├── login.html            # Login/registration page
    ├── css/
    │   ├── styles.css        # Main application styles
    │   └── auth.css          # Authentication page styles
    └── js/
        ├── main.js           # Main application logic
        ├── api.js            # API client
        ├── auth.js           # Authentication logic
        ├── charts.js         # Visualization logic
        └── journalUI.js      # Journal entry interface
```

## Setup Instructions

### Backend Setup

1. Install Python 3.8+ if not already installed

2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. Create a `.env` file in the backend directory with the following variables:
   ```
   MONGODB_URI=your_mongodb_connection_string
   MONGODB_DB_NAME=mindly_db
   GEMINI_API_KEY=your_gemini_api_key
   SECRET_KEY=your_random_secret_key_for_jwt
   ```

5. Run the development server:
   ```bash
   uvicorn app:app --reload
   ```

6. The API will be available at http://localhost:8000 with documentation at http://localhost:8000/docs

### Frontend Setup

1. For local development, you can use any simple HTTP server like Python's built-in server:
   ```bash
   cd frontend
   python -m http.server 3000
   ```

2. The frontend will be available at http://localhost:3000

3. Make sure the `API_CONFIG.baseUrl` in the frontend JavaScript files points to your backend URL

## Deployment

### Backend Deployment

The backend can be deployed to any cloud platform that supports Python:

- **Heroku**: Use a Procfile with `web: uvicorn app:app --host=0.0.0.0 --port=${PORT}`
- **AWS**: Deploy as a Lambda function or on EC2
- **Google Cloud**: Deploy on Cloud Run or App Engine
- **Azure**: Deploy on App Service

### Frontend Deployment

The frontend is static HTML/CSS/JS and can be deployed to:

- **Vercel**: Easy deployment with GitHub integration
- **Netlify**: Similar to Vercel with easy deployment
- **GitHub Pages**: For simple hosting
- **Firebase Hosting**: For Google Cloud integration

Remember to update the API URL in the frontend code to point to your deployed backend.

## MongoDB Setup

1. Create a MongoDB Atlas account or set up a local MongoDB server
2. Create a new database named `mindly_db`
3. Create collections: `users` and `journal_entries`
4. Get your connection string and add it to the `.env` file

## Google Gemini API Setup

1. Create a Google Cloud account if you don't have one
2. Enable the Gemini API
3. Create an API key
4. Add your API key to the `.env` file
