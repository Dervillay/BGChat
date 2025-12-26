## BGChat

BGChat saves you time hunting through board game rulebooks when you want to look up rules and settle disputes. To support its answers, it'll cite the rulebooks to you and give you handy links to the relevant pages so you can check for yourself.

**[Try it out here!](https://bg-chat.com)** 🎲

### Key features
- **AI-Powered Q&A**: Uses AI to answer board game questions
- **Semantic Search**: Finds relevant rulebook sections using embeddings
- **Rulebook PDFs**: Cites and provides access to rulebook PDFs
- **User Authentication**: Auth0 integration
- **Per-User Persistence**: Saves chat history and user settings
- **Token Management**: Daily usage limits and tracking

### Support the project

If BGChat has ever helped you settle board game disputes, consider supporting its development.
BGChat is free to use for eveyone, and your support helps to keep it that way.

[![Ko-fi](https://ko-fi.com/img/githubbutton_sm.svg)](https://ko-fi.com/dervillay)

## Developer setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.12+
- MongoDB Atlas account
- Auth0 account
- OpenAI API key

### Setup

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

Copy the example environment files and fill in your actual values:

**Backend:**
```bash
cd backend
cp .env.example .env.development
# Edit .env.development with your actual values
```

**Frontend:**
```bash
cd frontend
cp .env.example .env.development
# Edit .env with your actual values
```

5. **Start Development Servers**
```bash
./start-dev.sh
```

## Contributing

Contributions are welcome! Just:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.