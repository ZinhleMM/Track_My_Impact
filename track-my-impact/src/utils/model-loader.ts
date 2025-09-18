import * as tf from '@tensorflow/tfjs';

// Model configuration based on training script
// Allow runtime overrides via env vars
const envInputSize = Number(process.env.NEXT_PUBLIC_TMI_TFJS_INPUT || '224');
const envNorm = (process.env.NEXT_PUBLIC_TMI_TFJS_NORM || '0_1') as '0_1' | '-1_1';

export const MODEL_CONFIG = {
  INPUT_SIZE: Number.isFinite(envInputSize) && envInputSize > 0 ? envInputSize : 224,
  NUM_CLASSES: 31,
  MODEL_URL: '/model/model.json',
  LABELS_URL: '/labels.json',
  NORMALIZATION: envNorm, // '0_1' for [0,1] or '-1_1' for [-1,1]
};

// Waste classification labels (matches training script output)
export interface ClassificationResult {
  className: string;
  category: string;
  material: string;
  confidence: number;
  warmCategory: string;
}

// Model state management
let model: tf.LayersModel | null = null;
let labels: string[] = [];
let isModelLoading = false;

/**
 * Load the waste classification labels from public/labels.json
 */
export async function loadLabels(): Promise<string[]> {
  if (labels.length > 0) return labels;

  try {
    const response = await fetch(MODEL_CONFIG.LABELS_URL);
    if (!response.ok) {
      throw new Error(`Failed to load labels: ${response.statusText}`);
    }
    const data = await response.json();
    // Support multiple formats for convenience:
    // 1) ["class_a", "class_b", ...] (index order)
    // 2) [{ index: 0, name: "class_a" }, { index: 1, name: "class_b" }]
    // 3) { "0": "class_a", "1": "class_b" }
    if (Array.isArray(data)) {
      if (data.length && typeof data[0] === 'string') {
        labels = data as string[];
      } else if (data.length && typeof data[0] === 'object') {
        // Try object array format
        const arr = data as Array<any>;
        if (arr.every((x) => typeof x?.index === 'number' && (typeof x?.name === 'string' || typeof x?.className === 'string'))) {
          const maxIdx = Math.max(...arr.map((x) => x.index));
          const tmp: string[] = new Array(maxIdx + 1);
          for (const x of arr) tmp[x.index] = x.name ?? x.className;
          labels = tmp;
        } else if (arr.every((x) => typeof x?.name === 'string' || typeof x?.className === 'string')) {
          labels = arr.map((x) => x.name ?? x.className);
        } else {
          throw new Error('Unsupported labels array format');
        }
      } else {
        throw new Error('Unsupported labels.json format');
      }
    } else if (typeof data === 'object' && data) {
      // Object map format
      const entries = Object.entries(data as Record<string, string>)
        .map(([k, v]) => [Number(k), v] as [number, string])
        .filter(([k, v]) => Number.isFinite(k) && typeof v === 'string')
        .sort((a, b) => a[0] - b[0]);
      labels = entries.map(([, v]) => v);
    } else {
      throw new Error('Unsupported labels.json format');
    }

    console.log(`✓ Loaded ${labels.length} waste classification labels`);
    // Align expected classes to labels by default to avoid mismatches
    if (labels.length && MODEL_CONFIG.NUM_CLASSES !== labels.length) {
      console.warn(
        `NUM_CLASSES (${MODEL_CONFIG.NUM_CLASSES}) != labels length (${labels.length}). Using labels length.`
      );
      MODEL_CONFIG.NUM_CLASSES = labels.length;
    }
    return labels;
  } catch (error) {
    console.error('Error loading labels:', error);
    throw new Error('Could not load classification labels. Please ensure labels.json is available.');
  }
}

/**
 * Load the TensorFlow.js waste classification model
 */
export async function loadModel(): Promise<tf.LayersModel> {
  if (model) return model;

  if (isModelLoading) {
    // Wait for ongoing load to complete
    while (isModelLoading) {
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (model) return model;
  }

  isModelLoading = true;

  try {
    console.log('Loading waste classification model...');

    // Load TensorFlow.js model
    model = await tf.loadLayersModel(MODEL_CONFIG.MODEL_URL);

    // Verify model architecture
    const inputShape = model.inputs[0].shape;
    console.log(`✓ Model loaded successfully`);
    console.log(`  - Input shape: ${inputShape}`);
    console.log(`  - Expected: [null, ${MODEL_CONFIG.INPUT_SIZE}, ${MODEL_CONFIG.INPUT_SIZE}, 3]`);

    // Warm up the model with a dummy prediction
    const dummyInput = tf.zeros([1, MODEL_CONFIG.INPUT_SIZE, MODEL_CONFIG.INPUT_SIZE, 3]);
    const warmupPrediction = model.predict(dummyInput) as tf.Tensor;
    warmupPrediction.dispose();
    dummyInput.dispose();

    console.log('✓ Model warmed up and ready for inference');

  } catch (error) {
    console.error('Error loading model:', error);
    throw new Error('Could not load the waste classification model. Please ensure the model files are available in /public/model/');
  } finally {
    isModelLoading = false;
  }

  return model;
}

/**
 * Preprocess image for model prediction
 * Matches preprocessing from train_waste_classifier.py
 */
export function preprocessImage(imageElement: HTMLImageElement): tf.Tensor {
  return tf.tidy(() => {
    // Convert image to tensor
    let tensor = tf.browser.fromPixels(imageElement);

    // Resize to model input size (224x224)
    tensor = tf.image.resizeBilinear(tensor, [MODEL_CONFIG.INPUT_SIZE, MODEL_CONFIG.INPUT_SIZE]);

    // Normalize according to training
    if (MODEL_CONFIG.NORMALIZATION === '-1_1') {
      // Map from [0,255] -> [-1,1] (MobileNetV2 typical)
      tensor = tensor.toFloat().div(127.5).sub(1.0);
    } else {
      // Default: [0,1]
      tensor = tensor.toFloat().div(255.0);
    }

    // Add batch dimension
    tensor = tensor.expandDims(0);

    return tensor;
  });
}

/**
 * Parse label into structured format
 * Label format: "category_subcategory_specific_item"
 */
function parseLabel(label: string): { category: string; material: string; warmCategory: string } {
  const parts = label.split('_');

  if (parts.length < 2) {
    return {
      category: 'other',
      material: label,
      warmCategory: 'Mixed Materials'
    };
  }

  const category = parts[0];
  const material = parts.slice(1).join(' ').replace(/_/g, ' ');

  // Map to WARM categories based on the material type
  const warmMapping: Record<string, string> = {
    'glass': 'Glass Containers',
    'metal aluminum': 'Aluminum Cans',
    'metal steel': 'Steel Cans',
    'metal aerosol': 'Mixed Metals',
    'organic waste': 'Food Waste',
    'paper cardboard': 'Corrugated Cardboard',
    'paper office': 'Office Paper',
    'paper newspaper': 'Newspaper',
    'paper magazines': 'Mixed Paper',
    'paper paper cups': 'Mixed Paper',
    'plastic plastic soda bottles': 'PET Bottles',
    'plastic plastic water bottles': 'PET Bottles',
    'plastic plastic detergent bottles': 'HDPE Bottles',
    'plastic plastic food containers': 'Mixed Plastics',
    'plastic plastic shopping bags': 'Plastic Film',
    'plastic plastic trash bags': 'Plastic Film',
    'plastic disposable plastic cutlery': 'Mixed Plastics',
    'plastic styrofoam': 'Mixed Plastics',
    'textiles': 'Mixed Textiles'
  };

  const materialKey = `${category} ${material.split(' ').slice(0, 2).join(' ')}`;
  const warmCategory = warmMapping[materialKey] || warmMapping[category] || 'Mixed Materials';

  return {
    category,
    material: material.charAt(0).toUpperCase() + material.slice(1),
    warmCategory
  };
}

/**
 * Classify waste item from image
 */
export async function classifyWaste(imageElement: HTMLImageElement): Promise<ClassificationResult[]> {
  try {
    // Load model and labels
    const [loadedModel, loadedLabels] = await Promise.all([
      loadModel(),
      loadLabels()
    ]);

    // Preprocess image
    const preprocessedImage = preprocessImage(imageElement);

    // Make prediction
    const prediction = loadedModel.predict(preprocessedImage) as tf.Tensor;
    const scores = await prediction.data();

    // Clean up tensors
    preprocessedImage.dispose();
    prediction.dispose();

    // Get top 3 predictions
    const results: ClassificationResult[] = [];
    const scoreArray = Array.from(scores);

    // Create array of [index, score] pairs and sort by score
    const indexedScores = scoreArray
      .map((score, index) => ({ index, score }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 3); // Top 3 predictions

    for (const { index, score } of indexedScores) {
      const label = loadedLabels[index];
      const parsed = parseLabel(label);

      results.push({
        className: label,
        category: parsed.category,
        material: parsed.material,
        confidence: score,
        warmCategory: parsed.warmCategory
      });
    }

    return results;

  } catch (error) {
    console.error('Classification error:', error);
    throw new Error(`Classification failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Check if model is available
 */
export async function isModelAvailable(): Promise<boolean> {
  try {
    const response = await fetch(MODEL_CONFIG.MODEL_URL);
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Get model status and information
 */
export function getModelStatus(): {
  loaded: boolean;
  loading: boolean;
  labelsLoaded: boolean;
  expectedClasses: number;
  actualClasses: number;
  inputSize: number;
  normalization: string;
} {
  return {
    loaded: model !== null,
    loading: isModelLoading,
    labelsLoaded: labels.length > 0,
    expectedClasses: MODEL_CONFIG.NUM_CLASSES,
    actualClasses: labels.length,
    inputSize: MODEL_CONFIG.INPUT_SIZE,
    normalization: MODEL_CONFIG.NORMALIZATION,
  };
}
