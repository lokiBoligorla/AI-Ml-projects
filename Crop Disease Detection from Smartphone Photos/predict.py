import os
import sys
import pickle
import numpy as np
import tensorflow as tf
from PIL import Image
from utils.disease_info import get_disease_details

class CropDiseasePredictor:
    """
    A self-contained prediction engine that manages image preprocessing,
    inference (using either quantized TFLite or full Keras H5 models),
    and disease recommendations retrieval.
    """
    def __init__(self, model_dir="model"):
        self.model_dir = model_dir
        self.h5_path = os.path.join(model_dir, "crop_disease_model.h5")
        self.tflite_path = os.path.join(model_dir, "crop_disease_model.tflite")
        self.label_path = os.path.join(model_dir, "label_encoder.pkl")
        
        self.class_names = None
        self.model = None
        self.interpreter = None
        self.use_tflite = False
        
        # Initialize
        self._load_label_encoder()
        self._load_model()
        
    def _load_label_encoder(self):
        """Loads the pickled class category list."""
        if not os.path.exists(self.label_path):
            raise FileNotFoundError(
                f"Label encoder not found at '{self.label_path}'. "
                "You must run train.py first to generate labels and train the model."
            )
        with open(self.label_path, 'rb') as f:
            self.class_names = pickle.load(f)
        print(f"Loaded label encoder with {len(self.class_names)} classes.")
        
    def _load_model(self):
        """
        Loads the trained model.
        Prioritizes the quantized TFLite model for speed, with Keras H5 as a fallback.
        """
        if os.path.exists(self.tflite_path):
            print(f"Initializing quantized TFLite interpreter from: {self.tflite_path}")
            try:
                self.interpreter = tf.lite.Interpreter(model_path=self.tflite_path)
                self.interpreter.allocate_tensors()
                
                self.input_details = self.interpreter.get_input_details()
                self.output_details = self.interpreter.get_output_details()
                self.use_tflite = True
                print("Quantized TFLite prediction engine active!")
            except Exception as e:
                print(f"Warning: Failed to load TFLite model: {e}")
                print("Falling back to full H5 model check...")
                self._load_h5_model()
        else:
            self._load_h5_model()
            
    def _load_h5_model(self):
        """Loads the standard H5 Keras model."""
        if os.path.exists(self.h5_path):
            print(f"Loading full Keras H5 model from: {self.h5_path} (this might take a few seconds)...")
            self.model = tf.keras.models.load_model(self.h5_path)
            self.use_tflite = False
            print("Full Keras H5 prediction engine active!")
        else:
            raise FileNotFoundError(
                f"No models found in '{self.model_dir}'. "
                "Please run train.py to train the model first."
            )
            
    def preprocess_image(self, image_path_or_pil, target_size=(224, 224)):
        """
        Resizes and prepares an image for input.
        Note: Since our model includes the Rescaling layer natively, 
        we pass raw pixel values in range [0, 255].
        """
        if isinstance(image_path_or_pil, str):
            if not os.path.exists(image_path_or_pil):
                raise FileNotFoundError(f"Image not found at path: {image_path_or_pil}")
            img = Image.open(image_path_or_pil).convert('RGB')
        else:
            img = image_path_or_pil.convert('RGB')
            
        # Resize to input dimensions using bilinear scaling
        img_resized = img.resize(target_size, Image.Resampling.BILINEAR)
        
        # Convert to float32 NumPy array with range [0, 255]
        img_array = np.array(img_resized, dtype=np.float32)
        
        # Expand dimensions to create batch channel: (1, 224, 224, 3)
        img_batched = np.expand_dims(img_array, axis=0)
        return img_batched
        
    def predict(self, image_path_or_pil):
        """
        Runs model inference on a leaf image and retrieves comprehensive details.
        
        Returns:
            dict: Structured keys containing plant species, disease status, 
                  confidence, symptoms, treatment, and prevention suggestions.
        """
        # Preprocess image
        input_data = self.preprocess_image(image_path_or_pil)
        
        # Run inference
        if self.use_tflite:
            # Set input tensor
            self.interpreter.set_tensor(self.input_details[0]['index'], input_data)
            # Invoke the interpreter
            self.interpreter.invoke()
            # Get outputs
            predictions = self.interpreter.get_tensor(self.output_details[0]['index'])[0]
        else:
            # Full Keras predict
            predictions = self.model.predict(input_data, verbose=0)[0]
            
        # Extract classification index and confidence score
        pred_idx = np.argmax(predictions)
        confidence = float(predictions[pred_idx])
        raw_class_name = self.class_names[pred_idx]
        
        # Retrieve clinical descriptions and remedies
        details = get_disease_details(raw_class_name)
        
        # Pack final structured output
        result = {
            "raw_class": raw_class_name,
            "plant": details["plant"],
            "disease": details["disease"],
            "scientific_name": details["scientific_name"],
            "confidence": confidence,
            "confidence_percentage": f"{confidence * 100:.1f}%",
            "symptoms": details["symptoms"],
            "treatment": details["treatment"],
            "prevention": details["prevention"]
        }
        return result

if __name__ == "__main__":
    # Standard terminal testing script
    if len(sys.argv) < 2:
        print("Usage: python predict.py <path_to_leaf_image>")
        sys.exit(1)
        
    img_path = sys.argv[1]
    
    try:
        predictor = CropDiseasePredictor()
        res = predictor.predict(img_path)
        
        print("\n" + "="*50)
        print(" CROP DISEASE PREDICTION RESULT ")
        print("="*50)
        print(f"Plant Species : {res['plant']}")
        print(f"Health Status : {res['disease']}")
        print(f"Pathogen      : {res['scientific_name']}")
        print(f"Confidence    : {res['confidence_percentage']}")
        
        print("\nSymptoms:")
        for s in res['symptoms']:
            print(f" - {s}")
            
        print("\nTreatment Steps:")
        for t in res['treatment']:
            print(f" - {t}")
            
        print("\nPrevention Tips:")
        for p in res['prevention']:
            print(f" - {p}")
        print("="*50 + "\n")
        
    except Exception as e:
        print(f"Error during prediction: {e}")
        sys.exit(1)
