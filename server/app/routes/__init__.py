from .static import static_bp
from .profiles import profiles_bp
from .extensions import extensions_bp


def register_routes(app):
    app.register_blueprint(static_bp)
    app.register_blueprint(profiles_bp, url_prefix="/api/profiles")
    app.register_blueprint(extensions_bp, url_prefix="/api/extensions")
