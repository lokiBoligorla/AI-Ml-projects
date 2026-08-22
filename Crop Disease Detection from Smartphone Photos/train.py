import os
import sys
import pickle
import numpy as np
import tensorflow as tf
from utils.helpers import (
    create_folders,
    download_dataset,
    find_dataset_images_root,
    plot_training_history,
    plot_confusion_matrix_heatmap
)
from utils.preprocess import get_data_augmentation_pipeline

# Set random seed for reproducibility
tf.random.set_seed(42)
np.random.seed(42)

def build_crop_disease_model(num_classes):
    """
    Constructs the Keras transfer learning model using MobileNetV2.
    Embeds data augmentation and image rescaling natively inside the model 
    so the final output graph is self-contained and easy to deploy.
    """
    print("\nBuilding MobileNetV2 Transfer Learning Model...")
    
    # 1. Native data augmentation layer
    data_augmentation = get_data_augmentation_pipeline()
    
    # 2. Input Layer (expects raw image float tensors in range [0, 255])
    inputs = tf.keras.Input(shape=(224, 224, 3), name="input_image")
    
    # 3. Apply augmentation (only active during training)
    x = data_augmentation(inputs)
    
    # 4. Native Rescaling to map range [0, 255] -> [-1.0, 1.0] for MobileNetV2
    # This is mathematically identical to tf.keras.applications.mobilenet_v2.preprocess_input
    # but uses standard operations that convert flawlessly to TFLite.
    x = tf.keras.layers.Rescaling(scale=1./127.5, offset=-1.0, name="mobilenet_rescaling")(x)
    
    # 5. MobileNetV2 feature extractor
    base_model = tf.keras.applications.MobileNetV2(
        input_shape=(224, 224, 3),
        include_top=False,
        weights='imagenet'
    )
    
    # Freeze the pre-trained weights so we don't destroy features during early epochs
    base_model.trainable = False
    
    # Run the base model in inference mode (training=False is critical to freeze BatchNorm stats)
    x = base_model(x, training=False)
    
    # 6. Global pooling and dense classifier head
    x = tf.keras.layers.GlobalAveragePooling2D(name="global_pooling")(x)
    x = tf.keras.layers.Dropout(0.3, name="dropout_regularization")(x)
    outputs = tf.keras.layers.Dense(num_classes, activation='softmax', name="classifier_output")(x)
    
    # 7. Create final Keras model
    model = tf.keras.Model(inputs, outputs, name="Crop_Disease_Classifier")
    
    return model

def create_subset_directory(original_root, subset_root, max_images_per_class=150):
    """
    Creates a smaller, balanced subset of the dataset to speed up training dramatically
    on CPU environments, keeping accuracy high.
    """
    import shutil
    print(f"\nCreating a speed-optimized dataset subset at '{subset_root}' (Max {max_images_per_class} images per class)...")
    if os.path.exists(subset_root):
        try:
            shutil.rmtree(subset_root)
        except Exception as e:
            print(f"Warning: Could not remove old subset directory: {e}")
    os.makedirs(subset_root, exist_ok=True)
    
    class_dirs = [d for d in os.listdir(original_root) if os.path.isdir(os.path.join(original_root, d))]
    valid_classes_count = 0
    
    for c_dir in class_dirs:
        src_class_path = os.path.join(original_root, c_dir)
        
        # Get all images in the class
        images = [f for f in os.listdir(src_class_path) if f.lower().endswith(('.png', '.jpg', '.jpeg'))]
        
        # Skip if no images found (could be a nested directory)
        if len(images) == 0:
            print(f"  Skipping '{c_dir}' (no images found)")
            continue
        
        dst_class_path = os.path.join(subset_root, c_dir)
        os.makedirs(dst_class_path, exist_ok=True)
        
        # Shuffle to get a representative random sample
        np.random.shuffle(images)
        subset_images = images[:max_images_per_class]
        
        for img in subset_images:
            shutil.copy2(os.path.join(src_class_path, img), os.path.join(dst_class_path, img))
        
        print(f"  {c_dir}: copied {len(subset_images)}/{len(images)} images")
        valid_classes_count += 1
            
    print(f"Subset creation complete. Saved {valid_classes_count} classes to '{subset_root}'.")

def main():
    print("="*60)
    print(" STARTING CROP DISEASE DETECTOR TRAINING PIPELINE ")
    print("="*60)
    
    # Step 1: Create folders
    create_folders()
    
    # Step 2: Download dataset via Kaggle API
    try:
        download_dataset()
    except Exception as e:
        print(f"\nCould not download dataset automatically: {e}")
        print("Please check your kaggle.json file. Exiting training pipeline.")
        sys.exit(1)
        
    # Step 3: Locate the actual image directories and sub-sample for speed optimization
    dataset_base = "dataset"
    
    # Check for PlantVillage structure first
    plantvillage_path = os.path.join(dataset_base, "plantdisease", "PlantVillage")
    if os.path.exists(plantvillage_path):
        print(f"Found PlantVillage dataset at: {plantvillage_path}")
        original_dataset_root = plantvillage_path
    else:
        original_dataset_root = find_dataset_images_root(dataset_base)
    
    if not os.path.exists(original_dataset_root) or len(os.listdir(original_dataset_root)) == 0:
        print("Error: No valid dataset found. Training aborted.")
        sys.exit(1)
        
    subset_root = os.path.join("dataset", "dataset_subset")
    create_subset_directory(original_dataset_root, subset_root, max_images_per_class=150)
    dataset_root = subset_root
    
    print(f"\nLoading dataset from speed-optimized root: {dataset_root}")
    
    # Step 4: Create training and validation splits
    batch_size = 32
    image_size = (224, 224)
    
    print("Splitting dataset into Train (80%) and Validation (20%)...")
    
    # Categorical classification mode
    train_ds = tf.keras.utils.image_dataset_from_directory(
        dataset_root,
        validation_split=0.2,
        subset="training",
        seed=42,
        image_size=image_size,
        batch_size=batch_size,
        label_mode='categorical'
    )
    
    val_ds = tf.keras.utils.image_dataset_from_directory(
        dataset_root,
        validation_split=0.2,
        subset="validation",
        seed=42,
        image_size=image_size,
        batch_size=batch_size,
        label_mode='categorical'
    )
    
    # Save the label encoder mapping
    class_names = train_ds.class_names
    num_classes = len(class_names)
    print(f"\nDiscovered {num_classes} plant disease categories:")
    for idx, name in enumerate(class_names):
        print(f"  {idx}: {name}")
        
    label_encoder_path = os.path.join("model", "label_encoder.pkl")
    with open(label_encoder_path, "wb") as f:
        pickle.dump(class_names, f)
    print(f"\nLabel encoder saved to: {label_encoder_path}")
    
    # Optimize datasets for performance
    AUTOTUNE = tf.data.AUTOTUNE
    train_ds = train_ds.prefetch(buffer_size=AUTOTUNE)
    val_ds = val_ds.prefetch(buffer_size=AUTOTUNE)
    
    # Step 5: Build model
    model = build_crop_disease_model(num_classes)
    model.summary()
    
    # Step 6: Compile model
    # We use a relatively small learning rate since we are doing transfer learning
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=1e-4),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    
    # Step 7: Define callback list
    model_save_path = os.path.join("model", "crop_disease_model.h5")
    
    callbacks = [
        # Stop training if validation loss doesn't improve for 5 epochs
        tf.keras.callbacks.EarlyStopping(
            monitor='val_loss',
            patience=5,
            restore_best_weights=True,
            verbose=1
        ),
        # Save only the absolute best performing checkpoint
        tf.keras.callbacks.ModelCheckpoint(
            filepath=model_save_path,
            monitor='val_accuracy',
            save_best_only=True,
            mode='max',
            verbose=1
        ),
        # Shrink the learning rate when validation loss plateaus to fine-tune
        tf.keras.callbacks.ReduceLROnPlateau(
            monitor='val_loss',
            factor=0.2,
            patience=3,
            min_lr=1e-6,
            verbose=1
        )
    ]
    
    # Step 8: Train the model
    epochs = 5  # Speed-optimized: 5 epochs is plenty for transfer learning on CPU
    print(f"\nBeginning training for {epochs} epochs...")
    history = model.fit(
        train_ds,
        validation_data=val_ds,
        epochs=epochs,
        callbacks=callbacks
    )
    
    print("\nTraining completed!")
    
    # Step 9: Save training curves
    plot_training_history(history, save_path="model/training_history.png")
    
    # Step 10: Load best model and evaluate for confusion matrix
    print(f"\nLoading the best checkpointed model from: {model_save_path}")
    best_model = tf.keras.models.load_model(model_save_path)
    
    # Collect validation predictions
    print("Evaluating validation set to construct confusion matrix...")
    y_true = []
    y_pred = []
    
    for images, labels in val_ds:
        preds = best_model.predict(images, verbose=0)
        y_true.extend(np.argmax(labels.numpy(), axis=1))
        y_pred.extend(np.argmax(preds, axis=1))
        
    # Save confusion matrix heatmap
    plot_confusion_matrix_heatmap(
        y_true=y_true,
        y_pred=y_pred,
        class_names=class_names,
        save_path="model/confusion_matrix.png"
    )
    
    # Step 11: Quantized TFLite Conversion
    tflite_save_path = os.path.join("model", "crop_disease_model.tflite")
    print(f"\nConverting Keras model to quantized TFLite: '{tflite_save_path}'...")
    try:
        converter = tf.lite.TFLiteConverter.from_keras_model(best_model)
        
        # Apply standard float16 or integer post-training quantization
        converter.optimizations = [tf.lite.Optimize.DEFAULT]
        
        tflite_quantized_model = converter.convert()
        
        with open(tflite_save_path, "wb") as f:
            f.write(tflite_quantized_model)
            
        print(f"Quantized TFLite model successfully generated: {tflite_save_path}")
        
        # Log size differences
        h5_size = os.path.getsize(model_save_path) / (1024 * 1024)
        tflite_size = os.path.getsize(tflite_save_path) / (1024 * 1024)
        print(f"  - Original Keras model size: {h5_size:.2f} MB")
        print(f"  - Quantized TFLite model size: {tflite_size:.2f} MB (saved {(h5_size - tflite_size)/h5_size*100:.1f}%)")
        
    except Exception as e:
        print(f"Warning: TFLite conversion failed: {e}")
        print("Inference can still run perfectly using the .h5 model.")
        
    print("\n" + "="*60)
    print(" PIPELINE FINISHED SUCCESSFULLY! ")
    print("="*60 + "\n")

if __name__ == "__main__":
    main()
