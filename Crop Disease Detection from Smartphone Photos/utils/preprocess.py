import tensorflow as tf
import numpy as np
from PIL import Image

def preprocess_image_for_prediction(image_path_or_pil, target_size=(224, 224)):
    """
    Loads, resizes, and preprocesses an image for inference with MobileNetV2.
    
    Parameters:
        image_path_or_pil (str or PIL.Image): Path to the image file or a PIL Image object.
        target_size (tuple): Target (height, width) dimensions for resizing.
        
    Returns:
        np.ndarray: Preprocessed image array with a batch dimension added.
    """
    if isinstance(image_path_or_pil, str):
        img = Image.open(image_path_or_pil).convert('RGB')
    else:
        img = image_path_or_pil.convert('RGB')
        
    # Resize image to model input dimensions
    img_resized = img.resize(target_size, Image.Resampling.BILINEAR)
    
    # Convert image to numpy float array
    img_array = np.array(img_resized, dtype=np.float32)
    
    # Scale pixels between -1 and 1 as expected by MobileNetV2
    img_preprocessed = tf.keras.applications.mobilenet_v2.preprocess_input(img_array)
    
    # Expand dimensions to add batch channel: (1, 224, 224, 3)
    img_batched = np.expand_dims(img_preprocessed, axis=0)
    return img_batched

def get_data_augmentation_pipeline():
    """
    Creates a Keras Sequential pipeline representing standard data augmentations.
    This can be inserted as the first layer in the classification model to 
    perform augmentation dynamically on the GPU/CPU during training.
    
    Returns:
        tf.keras.Sequential: Augmentation pipeline layers.
    """
    data_augmentation = tf.keras.Sequential([
        # Random rotation between -20% and +20% of 360 degrees
        tf.keras.layers.RandomRotation(0.2),
        
        # Random zoom in/out by up to 20%
        tf.keras.layers.RandomZoom(0.2),
        
        # Random horizontal and vertical flips
        tf.keras.layers.RandomFlip("horizontal_and_vertical"),
        
        # Random contrast adjustments by up to 20%
        tf.keras.layers.RandomContrast(0.2),
    ], name="data_augmentation")
    return data_augmentation
