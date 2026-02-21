from .static import static_bp
from .logger import logger_bp
from .data import data_bp
from .foo import foo_bp


def register_routes(app):
    app.register_blueprint(static_bp)
    app.register_blueprint(logger_bp, url_prefix="/api/logger")
    app.register_blueprint(data_bp, url_prefix="/api/data")
    app.register_blueprint(foo_bp, url_prefix="/api/foo")
