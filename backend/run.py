import os
from app import create_app

app = create_app()

if __name__ == '__main__':
    env = os.environ.get('FLASK_ENV', 'development')

    if env == 'production':
        port = int(os.environ.get('PORT', 5000))
        app.run(host='0.0.0.0', port=port, debug=False)
    else:
        app.run(host='127.0.0.1', port=5000, debug=True)
