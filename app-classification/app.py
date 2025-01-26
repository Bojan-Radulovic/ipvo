from flask import Flask, request, jsonify
from MultimodalClassifier import *
import os
from werkzeug.utils import secure_filename



application = Flask(__name__)
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)


@application.route('/app-classification/test')
def test():
    return jsonify({'message': 'success!'})


@application.route('/app-classification/classify', methods=['POST'])
def classify():
    try:
        data = request.form.get('itemDescription')
        image = None
        image_path = None

        if 'image' in request.files:
            image = request.files['image']
            filename = secure_filename(image.filename)
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            image.save(file_path)
            image_path = file_path


        text_input = data

        # Predicting with both image and text
        model.eval()
        predicted_class_name_multimodal = predict(image_path=image_path, text=text_input, model=model, device=device, categories=image_categories)
        print(f"Predicted class (image + text): {predicted_class_name_multimodal}")

        if 'image' in request.files:
            os.remove(file_path)
        
        return jsonify({'result': 'success!', 'predicted_class': predicted_class_name_multimodal})
    except Exception as e:
        print(f"Classifier error: {e}")
        return jsonify({'result': 'Classifier error!', 'error': {e}})

if __name__ == '__main__':
    application.run()
