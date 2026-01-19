from flask import Flask
from flask_cors import CORS

app = Flask(__name__)


from controller.to_cards_controller import extract_bp

app.register_blueprint(extract_bp, url_prefix="/api")

if __name__ == '__main__':
    app.run(debug=True)