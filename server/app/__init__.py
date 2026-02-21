from flask import Flask
from flask_cors import CORS
from .config import load_config


def create_app():
    app = Flask(__name__)
    CORS(app)

    cfg = load_config()
    app.config.update(cfg)

    from .routes import register_routes
    register_routes(app)

    return app
