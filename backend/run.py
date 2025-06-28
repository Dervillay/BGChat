from app import create_app

app = create_app()

if __name__ == '__main__':
    app.run(
        host='0.0.0.0' if app.config.get('FLASK_ENV') == 'production' else '127.0.0.1',
        port=5000,
        debug=app.config.get('FLASK_DEBUG')
    )
