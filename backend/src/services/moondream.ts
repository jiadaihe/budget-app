import {
  AutoProcessor,
  AutoTokenizer,
  Moondream1ForConditionalGeneration,
  PreTrainedModel,
  PretrainedProcessorOptions,
  PreTrainedTokenizer,
  Processor,
  RawImage,
  Tensor,
} from "@huggingface/transformers";

// Define the pipeline components
interface MoondreamPipeline {
  readonly processor: Processor;
  readonly tokenizer: PreTrainedTokenizer;
  readonly model: PreTrainedModel;
}

export class MoondreamService {
  private pipeline: MoondreamPipeline | null = null;
  private isInitializing = false;
  private initializationPromise: Promise<void> | null = null;

  constructor() {
    this.initialize();
  }

  private async initialize(): Promise<void> {
    if (this.pipeline || this.isInitializing) {
      return this.initializationPromise || Promise.resolve();
    }

    this.isInitializing = true;
    this.initializationPromise = this.loadModel();
    
    try {
      await this.initializationPromise;
      console.log("✅ Moondream model loaded successfully");
    } catch (error) {
      console.error("❌ Failed to load Moondream model:", error);
      throw error;
    } finally {
      this.isInitializing = false;
    }
  }

  private async loadModel(): Promise<void> {
    console.log("🔄 Loading Moondream model...");
    const model_id = "Xenova/moondream2";

    try {
      const processor = await AutoProcessor.from_pretrained(
        model_id,
        {} as PretrainedProcessorOptions,
      );
      console.log("✅ Processor loaded");

      const tokenizer = await AutoTokenizer.from_pretrained(model_id);
      console.log("✅ Tokenizer loaded");

      const model = await Moondream1ForConditionalGeneration.from_pretrained(
        model_id,
        {
          // Remove problematic dtype configuration
          device: "cpu", // Use CPU for server-side inference
        },
      );
      console.log("✅ Model loaded");

      this.pipeline = { processor, tokenizer, model };
    } catch (error) {
      console.error("❌ Error loading model:", error);
      throw error;
    }
  }

  public async analyzeImage(imageUrl: string, prompt: string): Promise<string> {
    // Ensure model is loaded
    if (!this.pipeline) {
      await this.initialize();
    }

    if (!this.pipeline) {
      throw new Error("Model not initialized");
    }

    try {
      console.log("🔄 Processing image with prompt:", prompt);
      const { model, tokenizer, processor } = this.pipeline;

      const text = `<image>\n\nQuestion: ${prompt}\n\nAnswer:`;
      const text_inputs = tokenizer(text);

      const image = await RawImage.fromURL(imageUrl);
      const vision_inputs = await processor(image);

      console.log("🔄 Generating response...");
      const output = (await model.generate({
        ...text_inputs,
        ...vision_inputs,
        do_sample: false,
        max_new_tokens: 64,
      })) as Tensor;

      console.log("🔄 Decoding output...");
      const decoded = tokenizer.batch_decode(output, {
        skip_special_tokens: true,
      });
      const answer = decoded[0].split("Answer:")[1].trim();

      console.log("✅ Analysis complete:", answer);
      return answer;
    } catch (error) {
      console.error("❌ Error processing image:", error);
      throw new Error(`Failed to analyze image: ${error}`);
    }
  }

  public getStatus(): { isReady: boolean; isInitializing: boolean } {
    return {
      isReady: this.pipeline !== null,
      isInitializing: this.isInitializing,
    };
  }
}

// Export singleton instance
export const moondreamService = new MoondreamService(); 