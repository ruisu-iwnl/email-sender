from app import create_app


app = create_app()


if __name__ == '__main__':
    # For local development only
    app.run(debug=True)


