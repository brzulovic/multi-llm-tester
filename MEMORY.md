# LLM Multi-Tester Project Development History

## Recent Updates (based on git log)

### Latest Features:
1. **Target Messages Preview & Column Resizer Fix** (74c90a6)
   - Added Target Messages preview functionality
   - Fixed column resizer dragging issues

2. **Audio Previewer for TTS Responses** (0823a83)
   - Added audio preview with playback and download capabilities for Text-to-Speech responses

3. **Database Result Ratings** (2414eae)
   - Added support for rating results in the database

4. **Execution Settings Persistence & Sharing** (78704e0)
   - Implemented persistence and sharing of execution settings

5. **Supabase Sync Logging** (42c6d50)
   - Added sync logging to the Supabase configuration modal

6. **Sticky Results Header** (21cdba5)
   - Made results header sticky for better UX

7. **System Prompt Layer & Chart Interaction Tools** (cc83ea8)
   - Added system prompt configuration layer
   - Enhanced chart interaction capabilities

8. **System Prompt Injection & Supabase Data Viewer** (d9565aa)
   - Implemented system prompt injection functionality
   - Added Supabase data viewer

9. **Result Status Filtering & Token Count Sorting** (0ba8854)
   - Added filtering by result status
   - Implemented token count sorting

10. **Nerdy Kings Prompt Presets** (44a93ce)
    - Added Nerdy Kings test prompt presets (18 prompts)

11. **Theme Support & API Endpoint Management** (5e4ecfe)
    - Implemented multi-theme support (Light, Dark, Sepia variants)
    - Added API endpoint management capabilities

12. **Initial Project Scaffold** (a00e495)
    - Created initial project structure

13. **Initial Commit** (da19075)
    - Project initialization

## Project Overview
The LLM Multi-Tester & Benchmark Workbench is a developer-first, high-precision benchmarking suite for comparing Large Language Models compatible with OpenAI, LiteLLM, vLLM, Ollama, LM Studio, and Groq proxies.

## Key Features Implemented Over Time:
- Multi-model execution with sequential/parallel dispatch
- Server-Sent Events (SSE) streaming for low-latency token streaming
- Custom system prompt injection with model-specific targeting
- Interactive XY capability & benchmark graphs
- Chrome DevTools-grade network waterfall with sub-millisecond timing
- Token-level model comparison & diff viewer
- Multiple themes (Light, Dark, Sepia Light/Dark, Greenish Sepia)
- Supabase & history persistence with cloud sync
- Prompt presets including Nerdy Kings Test Battery
- Audio preview for TTS responses
- Result ratings and execution settings persistence
- Enhanced Supabase integration with sync logging
- Sticky UI components for better usability

## Technology Stack:
- React 19 with Vite
- TypeScript
- Tailwind CSS 4
- Lucide React for icons
- Framer Motion for animations
- Supabase for backend/database
- Various testing libraries (Vitest, Testing Library)

## Current Development Focus:
Recent commits indicate active development on:
- UI/UX improvements (column resizing, sticky headers, audio previews)
- Enhanced database/Supabase integration
- Advanced prompt engineering features (system prompt injection)
- Improved data visualization and comparison tools
- Better persistence and sharing capabilities