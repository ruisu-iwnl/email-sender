from flask import Flask
from dotenv import load_dotenv
import os


def create_app() -> Flask:
    load_dotenv()

    app = Flask(__name__, instance_relative_config=True)

    app.config.from_object('config.Config')

    os.makedirs(app.instance_path, exist_ok=True)

    from .routes import bp as main_bp
    app.register_blueprint(main_bp)

    return app


