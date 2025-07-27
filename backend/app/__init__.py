import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv

def create_app():
    load_dotenv()  # Carrega as variáveis do arquivo .env

    app = Flask(__name__)
    CORS(app)  # Habilita CORS para permitir requisições do frontend React

    # Registrar os blueprints (nossas rotas)
    from .api.routes import api_bp
    app.register_blueprint(api_bp, url_prefix='/api')

    return app