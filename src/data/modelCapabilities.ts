/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ModelCapabilityInfo {
  id: string;
  name: string;
  provider: string;
  contextWindow: number;
  contextWindowFormatted: string;
  modalities: string[];
  parameterSize?: string;
  architecture?: string;
  strengths: string[];
  functionCalling: boolean;
  reasoningEffort?: 'standard' | 'high' | 'thinking-enabled';
  pricingTier?: 'Free' | 'Low' | 'Medium' | 'High';
  description: string;
}

export const KNOWN_MODEL_CAPABILITIES: Record<string, Partial<ModelCapabilityInfo>> = {
  // OpenAI
  'gpt-4o': {
    name: 'GPT-4o (Omni)',
    provider: 'OpenAI',
    contextWindow: 128000,
    contextWindowFormatted: '128K tokens',
    modalities: ['Text', 'Vision', 'Audio', 'Code'],
    parameterSize: 'Omni (~200B+ MoE)',
    architecture: 'Multimodal Transformer',
    strengths: ['High-speed Multimodal', 'Complex Reasoning', 'Code Generation', 'JSON Mode'],
    functionCalling: true,
    pricingTier: 'Medium',
    description: 'Flagship omni model from OpenAI with native vision and ultra-fast generation.'
  },
  'gpt-4o-mini': {
    name: 'GPT-4o Mini',
    provider: 'OpenAI',
    contextWindow: 128000,
    contextWindowFormatted: '128K tokens',
    modalities: ['Text', 'Vision', 'Code'],
    parameterSize: 'Mini (~8B-15B)',
    architecture: 'Compact Multimodal',
    strengths: ['Cost-Efficiency', 'Low Latency', 'High Throughput', 'Everyday Tasks'],
    functionCalling: true,
    pricingTier: 'Low',
    description: 'Ultra-low cost, fast multimodal model suited for lightweight workflows.'
  },
  'o1': {
    name: 'OpenAI o1',
    provider: 'OpenAI',
    contextWindow: 200000,
    contextWindowFormatted: '200K tokens',
    modalities: ['Text', 'Vision', 'Code'],
    parameterSize: 'Reasoning Specialist',
    architecture: 'Deliberate Reasoning Transformer',
    strengths: ['Deep Chain-of-Thought', 'Advanced Mathematics', 'Competitive Coding', 'PhD-level Science'],
    functionCalling: true,
    reasoningEffort: 'thinking-enabled',
    pricingTier: 'High',
    description: 'Reasoning model trained with reinforcement learning for complex multi-step reasoning.'
  },
  'o1-mini': {
    name: 'OpenAI o1-mini',
    provider: 'OpenAI',
    contextWindow: 128000,
    contextWindowFormatted: '128K tokens',
    modalities: ['Text', 'Code'],
    parameterSize: 'Compact Reasoning',
    architecture: 'Reasoning-Focused Transformer',
    strengths: ['STEM Reasoning', 'Math & Logic', 'Code Synthesis', 'Faster than o1'],
    functionCalling: false,
    reasoningEffort: 'thinking-enabled',
    pricingTier: 'Medium',
    description: 'Specialized reasoning model for STEM and algorithmic coding.'
  },
  'o3-mini': {
    name: 'OpenAI o3-mini',
    provider: 'OpenAI',
    contextWindow: 200000,
    contextWindowFormatted: '200K tokens',
    modalities: ['Text', 'Code'],
    parameterSize: 'Compact Reasoning v3',
    architecture: 'Next-Gen Reasoning Transformer',
    strengths: ['Ultra-accurate STEM', 'Deep Reasoning', 'Code Generation', 'Configurable Reasoning Effort'],
    functionCalling: true,
    reasoningEffort: 'thinking-enabled',
    pricingTier: 'Low',
    description: 'Next-generation cost-effective reasoning model with customizable thinking depth.'
  },
  'gpt-4-turbo': {
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    contextWindow: 128000,
    contextWindowFormatted: '128K tokens',
    modalities: ['Text', 'Vision', 'Code'],
    parameterSize: 'Dense MoE',
    architecture: 'Transformer Decoder',
    strengths: ['Reliable Instruction Following', 'Long Context', 'Vision Analysis'],
    functionCalling: true,
    pricingTier: 'High',
    description: 'High-capability model with broad world knowledge and vision understanding.'
  },
  'gpt-3.5-turbo': {
    name: 'GPT-3.5 Turbo',
    provider: 'OpenAI',
    contextWindow: 16385,
    contextWindowFormatted: '16K tokens',
    modalities: ['Text', 'Code'],
    parameterSize: 'Legacy Fast (~20B)',
    architecture: 'Transformer Decoder',
    strengths: ['Fast Text Output', 'High Availability', 'Legacy Compatibility'],
    functionCalling: true,
    pricingTier: 'Low',
    description: 'Fast, legacy baseline text generation model.'
  },

  // Anthropic Claude
  'claude-3-5-sonnet': {
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    contextWindow: 200000,
    contextWindowFormatted: '200K tokens',
    modalities: ['Text', 'Vision', 'Code'],
    parameterSize: 'Mid-Tier Frontier',
    architecture: 'Transformer with Constitutional AI',
    strengths: ['State-of-the-art Coding', 'Complex Reasoning', 'Nuanced Tone', 'Visual Artifacts'],
    functionCalling: true,
    pricingTier: 'Medium',
    description: 'Industry benchmark for software engineering, deep analytical thinking, and visual reasoning.'
  },
  'claude-3-7-sonnet': {
    name: 'Claude 3.7 Sonnet',
    provider: 'Anthropic',
    contextWindow: 200000,
    contextWindowFormatted: '200K tokens',
    modalities: ['Text', 'Vision', 'Code'],
    parameterSize: 'Hybrid Reasoning Frontier',
    architecture: 'Hybrid Standard/Extended Thinking Transformer',
    strengths: ['Hybrid Instant & Extended Thinking', 'Advanced Architecture', 'Autonomous Coding'],
    functionCalling: true,
    reasoningEffort: 'thinking-enabled',
    pricingTier: 'Medium',
    description: 'First hybrid model with seamless toggling between instant response and deep extended thinking.'
  },
  'claude-3-5-haiku': {
    name: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
    contextWindow: 200000,
    contextWindowFormatted: '200K tokens',
    modalities: ['Text', 'Vision', 'Code'],
    parameterSize: 'Compact Frontier',
    architecture: 'High-Speed Transformer',
    strengths: ['Sub-second Latency', 'Strong Coding for Size', 'Fast Document Extraction'],
    functionCalling: true,
    pricingTier: 'Low',
    description: 'Lightning-fast compact model with capabilities matching prior generation flagship models.'
  },
  'claude-3-opus': {
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    contextWindow: 200000,
    contextWindowFormatted: '200K tokens',
    modalities: ['Text', 'Vision', 'Code'],
    parameterSize: 'Large Frontier (~300B+)',
    architecture: 'Large Transformer Decoder',
    strengths: ['Deep Literary Quality', 'Complex Strategy', 'Nuanced Synthesis'],
    functionCalling: true,
    pricingTier: 'High',
    description: 'Top-tier model for open-ended analysis and highest-complexity task synthesis.'
  },

  // Google Gemini & Gemma
  'gemini-2.0-flash': {
    name: 'Gemini 2.0 Flash',
    provider: 'Google',
    contextWindow: 1048576,
    contextWindowFormatted: '1M tokens',
    modalities: ['Text', 'Vision', 'Audio', 'Video', 'Code'],
    parameterSize: 'Next-Gen Native Multimodal',
    architecture: 'Native Multimodal Transformer',
    strengths: ['Ultra-low TTFB', '1M Context', 'Native Audio/Video', 'High Token Speed'],
    functionCalling: true,
    pricingTier: 'Low',
    description: 'Next-generation Gemini flagship optimized for speed, real-time multimodal inputs, and massive context.'
  },
  'gemini-2.0-flash-thinking': {
    name: 'Gemini 2.0 Flash Thinking',
    provider: 'Google',
    contextWindow: 1048576,
    contextWindowFormatted: '1M tokens',
    modalities: ['Text', 'Vision', 'Code'],
    parameterSize: 'Reasoning Specialist',
    architecture: 'Thinking Process Transformer',
    strengths: ['Visible Reasoning Steps', 'Complex Problem Solving', 'Algorithmic Logic'],
    functionCalling: true,
    reasoningEffort: 'thinking-enabled',
    pricingTier: 'Low',
    description: 'Gemini model that surfaces its intermediate thinking process before answering.'
  },
  'gemini-1.5-pro': {
    name: 'Gemini 1.5 Pro',
    provider: 'Google',
    contextWindow: 2097152,
    contextWindowFormatted: '2M tokens',
    modalities: ['Text', 'Vision', 'Audio', 'Video', 'Code'],
    parameterSize: 'Frontier Sparse MoE',
    architecture: 'Sparse Mixture of Experts',
    strengths: ['2 Million Token Window', 'Massive Codebase Ingestion', 'Long-form Video Reasoning'],
    functionCalling: true,
    pricingTier: 'Medium',
    description: 'Long-context champion capable of processing entire libraries, video hours, and huge code repositories.'
  },
  'gemini-1.5-flash': {
    name: 'Gemini 1.5 Flash',
    provider: 'Google',
    contextWindow: 1048576,
    contextWindowFormatted: '1M tokens',
    modalities: ['Text', 'Vision', 'Audio', 'Video', 'Code'],
    parameterSize: 'Distilled Fast MoE',
    architecture: 'Distilled Multimodal Transformer',
    strengths: ['1M Context', 'High Throughput', 'Low Cost', 'Quick Summaries'],
    functionCalling: true,
    pricingTier: 'Low',
    description: 'Lightweight, fast model designed for high-frequency tasks and million-token analysis.'
  },
  'mygemma3': {
    name: 'Gemma 3 (Local / Fine-tuned)',
    provider: 'Google / Open-Weights',
    contextWindow: 128000,
    contextWindowFormatted: '128K tokens',
    modalities: ['Text', 'Vision', 'Code'],
    parameterSize: '12B Parameters',
    architecture: 'Open-Weight Multimodal Transformer',
    strengths: ['Local Execution', 'Multilingual Support', 'Edge Reasoning', 'High Quality-to-Size Ratio'],
    functionCalling: true,
    pricingTier: 'Free',
    description: 'Open-weights foundation model from Google built on Gemini research for on-device and local servers.'
  },
  'gemma-2-27b': {
    name: 'Gemma 2 27B',
    provider: 'Google / Open-Weights',
    contextWindow: 8192,
    contextWindowFormatted: '8K tokens',
    modalities: ['Text', 'Code'],
    parameterSize: '27B Parameters',
    architecture: 'Dense Transformer with Sliding Window Attention',
    strengths: ['Outperforms larger models', 'Local GPU inference', 'Competitive coding'],
    functionCalling: true,
    pricingTier: 'Free',
    description: 'High-performing open-weights model capable of running on consumer hardware.'
  },
  'gemma-2-9b': {
    name: 'Gemma 2 9B',
    provider: 'Google / Open-Weights',
    contextWindow: 8192,
    contextWindowFormatted: '8K tokens',
    modalities: ['Text', 'Code'],
    parameterSize: '9B Parameters',
    architecture: 'Dense Transformer',
    strengths: ['Fast Local Speed', 'Low VRAM Footprint', 'Solid Instruction Following'],
    functionCalling: true,
    pricingTier: 'Free',
    description: 'Efficient local model running fast on single GPUs or Ollama.'
  },

  // DeepSeek
  'deepseek-r1': {
    name: 'DeepSeek R1',
    provider: 'DeepSeek',
    contextWindow: 128000,
    contextWindowFormatted: '128K tokens',
    modalities: ['Text', 'Code'],
    parameterSize: '671B MoE (37B active)',
    architecture: 'DeepSeek Sparse MoE with Multi-Head Latent Attention',
    strengths: ['Pure Open Reasoning', 'Math & Code Olympiad', 'Self-verification', 'Cost-effective'],
    functionCalling: true,
    reasoningEffort: 'thinking-enabled',
    pricingTier: 'Low',
    description: 'Open reasoning model trained via large-scale reinforcement learning, matching frontier reasoning benchmarks.'
  },
  'deepseek-v3': {
    name: 'DeepSeek V3',
    provider: 'DeepSeek',
    contextWindow: 128000,
    contextWindowFormatted: '128K tokens',
    modalities: ['Text', 'Code'],
    parameterSize: '671B MoE (37B active)',
    architecture: 'Sparse Mixture of Experts with MLA & DeepSeekMoE',
    strengths: ['High Speed Generation', 'General Reasoning', 'Coding & Math', 'Unmatched Price/Performance'],
    functionCalling: true,
    pricingTier: 'Low',
    description: 'Frontier open-weights 671B Mixture-of-Experts model with high token generation throughput.'
  },
  'deepseek-chat': {
    name: 'DeepSeek Chat (V3)',
    provider: 'DeepSeek',
    contextWindow: 128000,
    contextWindowFormatted: '128K tokens',
    modalities: ['Text', 'Code'],
    parameterSize: '671B MoE',
    architecture: 'Sparse Mixture of Experts',
    strengths: ['Conversational Fluency', 'Coding Assistance', 'Markdown Formatting'],
    functionCalling: true,
    pricingTier: 'Low',
    description: 'Standard conversational endpoint for DeepSeek V3.'
  },
  'deepseek-reasoner': {
    name: 'DeepSeek Reasoner (R1)',
    provider: 'DeepSeek',
    contextWindow: 128000,
    contextWindowFormatted: '128K tokens',
    modalities: ['Text', 'Code'],
    parameterSize: '671B MoE Reasoning',
    architecture: 'Reinforcement Learning Reasoning MoE',
    strengths: ['Chain-of-thought Reasoning', 'Mathematical Proofs', 'Algorithm Design'],
    functionCalling: false,
    reasoningEffort: 'thinking-enabled',
    pricingTier: 'Low',
    description: 'Dedicated reasoning endpoint outputting full reasoning tokens and final answer.'
  },

  // Meta Llama
  'llama-3.3-70b-instruct': {
    name: 'Llama 3.3 70B Instruct',
    provider: 'Meta',
    contextWindow: 128000,
    contextWindowFormatted: '128K tokens',
    modalities: ['Text', 'Code'],
    parameterSize: '70B Parameters',
    architecture: 'Grouped-Query Attention Transformer',
    strengths: ['Matches Llama 3.1 405B quality', 'Fast Inference', 'Enterprise Deployment', 'Tool Calling'],
    functionCalling: true,
    pricingTier: 'Low',
    description: 'Meta flagship open-weights model delivering 405B-class intelligence in a 70B parameter size.'
  },
  'llama-3.1-405b-instruct': {
    name: 'Llama 3.1 405B Instruct',
    provider: 'Meta',
    contextWindow: 128000,
    contextWindowFormatted: '128K tokens',
    modalities: ['Text', 'Code'],
    parameterSize: '405B Parameters',
    architecture: 'Dense Transformer with GQA',
    strengths: ['Maximum Open Intelligence', 'Synthetic Data Generation', 'Model Distillation', 'Broad Knowledge'],
    functionCalling: true,
    pricingTier: 'Medium',
    description: 'Largest open foundation model with frontier capabilities and extensive multi-domain knowledge.'
  },
  'llama-3.1-70b-instruct': {
    name: 'Llama 3.1 70B Instruct',
    provider: 'Meta',
    contextWindow: 128000,
    contextWindowFormatted: '128K tokens',
    modalities: ['Text', 'Code'],
    parameterSize: '70B Parameters',
    architecture: 'Dense Transformer with GQA',
    strengths: ['Reliable Coding', 'Multilingual Dialogue', 'Strong Reasoning'],
    functionCalling: true,
    pricingTier: 'Low',
    description: 'Widely deployed 70B model with 128K context window.'
  },
  'llama-3.1-8b-instruct': {
    name: 'Llama 3.1 8B Instruct',
    provider: 'Meta',
    contextWindow: 128000,
    contextWindowFormatted: '128K tokens',
    modalities: ['Text', 'Code'],
    parameterSize: '8B Parameters',
    architecture: 'Compact Dense Transformer',
    strengths: ['High Speed / Low Latency', 'Local Edge Deployments', 'Cost Effective'],
    functionCalling: true,
    pricingTier: 'Free',
    description: 'Workhorse compact model capable of running on mobile devices or local CPUs.'
  },

  // Mistral AI
  'mistral-large': {
    name: 'Mistral Large 2',
    provider: 'Mistral AI',
    contextWindow: 128000,
    contextWindowFormatted: '128K tokens',
    modalities: ['Text', 'Code'],
    parameterSize: '123B Parameters',
    architecture: 'Dense Transformer',
    strengths: ['Multilingual Mastery (French, German, Spanish)', 'Strong Code Reasoning', 'Precise Instruction Following'],
    functionCalling: true,
    pricingTier: 'Medium',
    description: 'Flagship multilingual European model with advanced reasoning and code synthesis.'
  },
  'codestral': {
    name: 'Codestral 22B',
    provider: 'Mistral AI',
    contextWindow: 256000,
    contextWindowFormatted: '256K tokens',
    modalities: ['Code', 'Text'],
    parameterSize: '22B Parameters',
    architecture: 'Fill-In-The-Middle Code Transformer',
    strengths: ['Fill-in-the-Middle (FIM)', '80+ Programming Languages', '256K Context Window', 'Test Generation'],
    functionCalling: true,
    pricingTier: 'Low',
    description: 'Specialized generative model trained specifically for code generation, bug fixing, and repository exploration.'
  },
  'mixtral-8x7b': {
    name: 'Mixtral 8x7B',
    provider: 'Mistral AI',
    contextWindow: 32768,
    contextWindowFormatted: '32K tokens',
    modalities: ['Text', 'Code'],
    parameterSize: '46.7B MoE (12.9B active)',
    architecture: 'Sparse Mixture of Experts',
    strengths: ['Pioneer Open MoE', 'Fast Active Token Processing', 'Fluent Multilingual'],
    functionCalling: true,
    pricingTier: 'Low',
    description: 'Groundbreaking sparse MoE model routing 2 experts per token.'
  },

  // Qwen
  'qwen-2.5-72b-instruct': {
    name: 'Qwen 2.5 72B Instruct',
    provider: 'Alibaba Cloud',
    contextWindow: 131072,
    contextWindowFormatted: '128K tokens',
    modalities: ['Text', 'Code'],
    parameterSize: '72B Parameters',
    architecture: 'Dense Transformer with SwiGLU',
    strengths: ['Leaderboard Math & Code', 'Multilingual & Asian Languages', 'Structured JSON Output'],
    functionCalling: true,
    pricingTier: 'Low',
    description: 'Premier open-weight LLM scoring near-frontier scores across coding, math, and knowledge benchmarks.'
  },
  'qwen-2.5-coder-32b-instruct': {
    name: 'Qwen 2.5 Coder 32B Instruct',
    provider: 'Alibaba Cloud',
    contextWindow: 131072,
    contextWindowFormatted: '128K tokens',
    modalities: ['Code', 'Text'],
    parameterSize: '32B Parameters',
    architecture: 'Code-Specialized Transformer',
    strengths: ['Dedicated Code Specialist', 'Matches 70B+ Coding Models', 'Refactoring & Debugging'],
    functionCalling: true,
    pricingTier: 'Low',
    description: 'State-of-the-art open coding model rivaling flagship frontier models in programming tests.'
  },

  // Defaults & Local Models
  'free': {
    name: 'Free Proxy Tier Model',
    provider: 'LiteLLM / Public Gateway',
    contextWindow: 65536,
    contextWindowFormatted: '64K tokens',
    modalities: ['Text', 'Code'],
    parameterSize: 'Gateway Proxy Allocation',
    architecture: 'Proxy Multi-Model Load Balancer',
    strengths: ['No API Key Required', 'Rapid Prototyping', 'Standard OpenAI Protocol'],
    functionCalling: true,
    pricingTier: 'Free',
    description: 'Default free endpoint model routed through the local or public test gateway.'
  },
  'mygroq': {
    name: 'Groq LPU Accelerated Model',
    provider: 'Groq / LPU',
    contextWindow: 128000,
    contextWindowFormatted: '128K tokens',
    modalities: ['Text', 'Code'],
    parameterSize: 'LPU Hardware Accelerated',
    architecture: 'Tensor Streaming Processor Architecture',
    strengths: ['Ultra-high TPS (300-800 tok/s)', 'Near-zero TTFB', 'Instant Conversational Responses'],
    functionCalling: true,
    pricingTier: 'Low',
    description: 'Hardware accelerated inference on Groq Language Processing Units for extreme token velocity.'
  }
};

/**
 * Intelligent capability extractor and fallback resolver for any model name.
 */
export function getModelCapabilities(rawModelName: string): ModelCapabilityInfo {
  const clean = rawModelName.trim().toLowerCase();
  
  // Exact or normalized key check
  for (const [key, info] of Object.entries(KNOWN_MODEL_CAPABILITIES)) {
    if (clean === key.toLowerCase() || clean.includes(key.toLowerCase()) || key.toLowerCase().includes(clean)) {
      return {
        id: rawModelName,
        name: info.name || rawModelName,
        provider: info.provider || 'AI Provider',
        contextWindow: info.contextWindow || 128000,
        contextWindowFormatted: info.contextWindowFormatted || '128K tokens',
        modalities: info.modalities || ['Text', 'Code'],
        parameterSize: info.parameterSize || 'Standard',
        architecture: info.architecture || 'Transformer Decoder',
        strengths: info.strengths || ['General Completion', 'Instruction Following'],
        functionCalling: info.functionCalling ?? true,
        reasoningEffort: info.reasoningEffort || (clean.includes('reason') || clean.includes('r1') || clean.includes('o1') || clean.includes('thinking') ? 'thinking-enabled' : 'standard'),
        pricingTier: info.pricingTier || 'Low',
        description: info.description || `LLM Model ${rawModelName} configured for inference benchmark testing.`
      };
    }
  }

  // Heuristic-based inference
  let provider = 'Custom / Local';
  if (clean.includes('gpt') || clean.includes('openai') || clean.startsWith('o1') || clean.startsWith('o3')) provider = 'OpenAI';
  else if (clean.includes('claude') || clean.includes('anthropic')) provider = 'Anthropic';
  else if (clean.includes('gemini') || clean.includes('gemma')) provider = 'Google';
  else if (clean.includes('llama') || clean.includes('meta')) provider = 'Meta';
  else if (clean.includes('deepseek')) provider = 'DeepSeek';
  else if (clean.includes('mistral') || clean.includes('codestral') || clean.includes('mixtral')) provider = 'Mistral AI';
  else if (clean.includes('qwen')) provider = 'Alibaba Cloud';
  else if (clean.includes('phi')) provider = 'Microsoft';
  else if (clean.includes('groq')) provider = 'Groq LPU';
  else if (clean.includes('ollama')) provider = 'Ollama Local';
  else if (clean.includes('vllm')) provider = 'vLLM Local Server';

  const modalities: string[] = ['Text'];
  if (clean.includes('vision') || clean.includes('vl') || clean.includes('4o') || clean.includes('gemini') || clean.includes('multimodal')) {
    modalities.push('Vision');
  }
  if (clean.includes('code') || clean.includes('coder') || clean.includes('instruct') || clean.includes('dev') || clean.includes('chat')) {
    modalities.push('Code');
  }

  // Extract parameter size heuristic like 70b, 8b, 12b, 405b, etc.
  const paramMatch = clean.match(/(\d+(?:\.\d+)?b)\b/i);
  const parameterSize = paramMatch ? paramMatch[1].toUpperCase() + ' Parameters' : (clean.includes('mini') ? 'Compact / Lightweight' : 'Standard');

  // Context window heuristic
  let contextWindow = 128000;
  let contextWindowFormatted = '128K tokens';
  if (clean.includes('2m')) {
    contextWindow = 2097152;
    contextWindowFormatted = '2M tokens';
  } else if (clean.includes('1m') || clean.includes('gemini-2') || clean.includes('gemini-1.5')) {
    contextWindow = 1048576;
    contextWindowFormatted = '1M tokens';
  } else if (clean.includes('256k')) {
    contextWindow = 262144;
    contextWindowFormatted = '256K tokens';
  } else if (clean.includes('200k') || clean.includes('claude-3') || clean.includes('o1')) {
    contextWindow = 200000;
    contextWindowFormatted = '200K tokens';
  } else if (clean.includes('32k')) {
    contextWindow = 32768;
    contextWindowFormatted = '32K tokens';
  } else if (clean.includes('16k')) {
    contextWindow = 16384;
    contextWindowFormatted = '16K tokens';
  } else if (clean.includes('8k')) {
    contextWindow = 8192;
    contextWindowFormatted = '8K tokens';
  }

  const strengths: string[] = [];
  if (clean.includes('reason') || clean.includes('r1') || clean.includes('o1') || clean.includes('o3') || clean.includes('thinking')) {
    strengths.push('Chain-of-thought Reasoning', 'STEM & Math');
  }
  if (clean.includes('code') || clean.includes('coder')) {
    strengths.push('Software Engineering', 'Code Synthesis');
  }
  if (strengths.length === 0) {
    strengths.push('Instruction Following', 'Knowledge Synthesis', 'Prompt Completion');
  }

  return {
    id: rawModelName,
    name: rawModelName,
    provider,
    contextWindow,
    contextWindowFormatted,
    modalities,
    parameterSize,
    architecture: clean.includes('moe') ? 'Mixture of Experts (MoE)' : 'Transformer Decoder',
    strengths,
    functionCalling: !clean.includes('base'),
    reasoningEffort: (clean.includes('reason') || clean.includes('r1') || clean.includes('o1') || clean.includes('thinking')) ? 'thinking-enabled' : 'standard',
    pricingTier: 'Medium',
    description: `Configured model ${rawModelName} from ${provider} with ${contextWindowFormatted} context window.`
  };
}
