# BGChat

BGChat is an AI-powered tool that helps users understand board game rules and situations by analyzing rulebook PDFs and providing contextual answers to questions.

**[Check it out here](https://bg-chat.com)** 🎲

## Support the Project

If BGChat helps you settle board game disputes, consider supporting its development.
Your support helps keep BGChat free for all members of the board game community.

[![Ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/dervillay)


## 🔧 Key Features

- **AI-Powered Q&A**: Uses GPT-4 to answer board game questions
- **Semantic Search**: Finds relevant rulebook sections using embeddings
- **Streaming Responses**: Real-time AI responses
- **PDF Integration**: Direct access to rulebook PDFs
- **User Authentication**: Secure Auth0 integration
- **Message History**: Persistent chat history per user
- **Token Management**: Daily usage limits and tracking

## 🏗️ Architecture Overview

- **Frontend**: React 19 with TypeScript, Chakra UI, deployed on Vercel
- **Backend**: Flask 3.1 API with Python 3.12, deployed on Railway
- **Database**: MongoDB Atlas
- **Authentication**: Auth0
- **AI**: OpenAI API

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.12+
- MongoDB Atlas account
- Auth0 account
- OpenAI API key

### Development Setup

1. **Clone the repository**
```bash
git clone https://github.com/Dervillay/BGChat.git
cd BGChat
```

2. **Backend Setup**
```bash
cd backend
python3 -m venv myenv
source myenv/bin/activate  # On Windows: myenv\Scripts\activate
pip install -r requirements.txt
```

3. **Frontend Setup**
```bash
cd frontend
npm install
```

4. **Environment Configuration**

Create `.env.development` in the `backend/` directory:
```env
FLASK_ENV=development
FLASK_DEBUG=True
FLASK_APP=run.py

# MongoDB
MONGODB_HOST=your-dev-mongodb-host
MONGODB_USERNAME=your-dev-username
MONGODB_PASSWORD=your-dev-password
MONGODB_DB_NAME=you-dev-db-name

# OpenAI
OPENAI_API_KEY=your-openai-api-key

# Auth0
AUTH0_DOMAIN=your-dev-auth0-domain
AUTH0_AUDIENCE=your-dev-audience
ALGORITHM=RS256

# Security
SECRET_KEY=dev-secret-key-change-in-production
```

Create `.env.development` in the `frontend/` directory:
```env
REACT_APP_ENVIRONMENT=development
REACT_APP_API_URL=http://localhost:5000
REACT_APP_AUTH0_DOMAIN=your-dev-auth0-domain
REACT_APP_AUTH0_CLIENT_ID=your-dev-client-id
REACT_APP_AUTH0_AUDIENCE=your-dev-audience
```

5. **Start Development Servers**
```bash
./start-dev.sh
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.