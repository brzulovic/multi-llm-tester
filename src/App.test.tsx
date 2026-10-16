import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import App from "./App";

describe("LLM Multi-Tester App", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders the main title", () => {
    render(<App />);
    expect(screen.getByText("LLM Multi-Tester")).toBeInTheDocument();
  });

  it("allows changing the Custom Proxy Base URL and Endpoint Type", () => {
    render(<App />);
    const proxyBaseInput = screen.getByPlaceholderText("http://localhost:4100/") as HTMLInputElement;
    expect(proxyBaseInput.value).toBe("http://localhost:4100/");
    
    // Check Endpoint Type select box has options
    const endpointTypeSelect = screen.getByTestId("endpoint-type-select") as HTMLSelectElement;
    expect(endpointTypeSelect.value).toBe("/v1/chat/completions");

    // Change Custom Proxy Base URL
    fireEvent.change(proxyBaseInput, { target: { value: "http://test-api.com/" } });
    expect(proxyBaseInput.value).toBe("http://test-api.com/");

    // Change Endpoint Type to /v1/responses
    fireEvent.change(endpointTypeSelect, { target: { value: "/v1/responses" } });
    expect(endpointTypeSelect.value).toBe("/v1/responses");

    // Target display updates
    expect(screen.getByTestId("target-endpoint-display").textContent).toBe("http://test-api.com/v1/responses");
  });

  it("allows changing the model list", () => {
    render(<App />);
    const modelListTextarea = screen.getByPlaceholderText(/free/i) as HTMLTextAreaElement;
    expect(modelListTextarea.value).toBe("free");
    fireEvent.change(modelListTextarea, { target: { value: "gpt-4\ngpt-3.5" } });
    expect(modelListTextarea.value).toBe("gpt-4\ngpt-3.5");
  });

  it("toggles parallel mode", () => {
    render(<App />);
    const parallelCheckbox = screen.getByRole("checkbox") as HTMLInputElement;
    expect(parallelCheckbox.checked).toBe(false);
    
    fireEvent.click(parallelCheckbox);
    expect(parallelCheckbox.checked).toBe(true);
  });

  it("shows parallel count input when parallel mode is active", () => {
    render(<App />);
    const parallelCheckbox = screen.getByRole("checkbox");
    
    // Initially not visible (or not in DOM)
    expect(screen.queryByRole("spinbutton")).not.toBeInTheDocument();
    
    fireEvent.click(parallelCheckbox);
    expect(screen.getByRole("spinbutton")).toBeInTheDocument();
  });

  it("sends custom headers in the fetch request", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ choices: [{ message: { content: "test" } }], usage: {} }),
    });
    (global as any).fetch = mockFetch;

    render(<App />);
    
    const headersTextarea = screen.getByPlaceholderText("x-litellm-api-key: Bearer sk-1234") as HTMLTextAreaElement;
    fireEvent.change(headersTextarea, { target: { value: "Authorization: Bearer my-token\nX-Custom: value" } });
    
    const generateButton = screen.getByText("Generate");
    fireEvent.click(generateButton);

    // Wait for fetch to be called
    await vi.waitFor(() => expect(mockFetch).toHaveBeenCalled());

    const lastCallHeaders = mockFetch.mock.calls[0][1].headers;
    expect(lastCallHeaders["Authorization"]).toBe("Bearer my-token");
    expect(lastCallHeaders["X-Custom"]).toBe("value");
    expect(lastCallHeaders["Content-Type"]).toBe("application/json");
  });

  it("displays DevTools network metrics waterfall after model execution", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: () => Promise.resolve({
        choices: [{ message: { content: "Sample response from model" } }],
        usage: { prompt_tokens: 15, completion_tokens: 45, total_tokens: 60 }
      }),
    });
    (global as any).fetch = mockFetch;

    render(<App />);

    // Set to 1 model for deterministic testing
    const modelListTextarea = screen.getByPlaceholderText(/myGemma3/i) as HTMLTextAreaElement;
    fireEvent.change(modelListTextarea, { target: { value: "test-model-1" } });

    const generateButton = screen.getByText("Generate");
    fireEvent.click(generateButton);

    // Wait for the DevTools Network Timing Waterfall to be displayed
    expect(await screen.findByText("Network Timing Waterfall")).toBeInTheDocument();

    // Await completion of the request
    expect(await screen.findByText("DevTools Network Timing")).toBeInTheDocument();

    // Check that DevTools Network features are rendered
    expect(screen.getByText("DevTools")).toBeInTheDocument();
    expect(screen.getByText("Queueing")).toBeInTheDocument();
    expect(screen.getByText("Waiting (TTFB)")).toBeInTheDocument();
  });

  it("allows switching between Split, DevTools Network, and Cards view modes", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      statusText: "OK",
      json: () => Promise.resolve({
        choices: [{ message: { content: "Response content" } }],
        usage: { prompt_tokens: 10, completion_tokens: 20, total_tokens: 30 }
      }),
    });
    (global as any).fetch = mockFetch;

    render(<App />);

    const modelListTextarea = screen.getByPlaceholderText(/myGemma3/i) as HTMLTextAreaElement;
    fireEvent.change(modelListTextarea, { target: { value: "test-model-alpha" } });

    const generateButton = screen.getByText("Generate");
    fireEvent.click(generateButton);

    expect(await screen.findByText("DevTools Network Timing")).toBeInTheDocument();

    // Click DevTools Network view mode
    const networkViewBtn = screen.getByRole("button", { name: /DevTools Network/i });
    fireEvent.click(networkViewBtn);

    // Network timing waterfall should be visible
    expect(screen.getByText("Network Timing Waterfall")).toBeInTheDocument();

    // Inspect Breakdown button in card
    const splitBtn = screen.getByRole("button", { name: /Split/i });
    fireEvent.click(splitBtn);

    const inspectBtn = screen.getByRole("button", { name: /Inspect Breakdown/i });
    fireEvent.click(inspectBtn);

    // Full Timing drawer should now be open
    expect(screen.getByText("Resource Scheduling")).toBeInTheDocument();
    expect(screen.getByText("Request sent")).toBeInTheDocument();
  });

  it("includes timeout parameter in request payload and headers", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({ choices: [{ message: { content: "ok" } }], usage: {} }),
    });
    (global as any).fetch = mockFetch;

    render(<App />);

    const modelListTextarea = screen.getByPlaceholderText(/myGemma3/i) as HTMLTextAreaElement;
    fireEvent.change(modelListTextarea, { target: { value: "ollama-glm-5:cloud" } });

    // Click 5m (300s) timeout preset or verify 300s is sent
    const generateBtn = screen.getByText("Generate");
    fireEvent.click(generateBtn);

    await vi.waitFor(() => expect(mockFetch).toHaveBeenCalled());

    const fetchCall = mockFetch.mock.calls[0];
    const headers = fetchCall[1].headers;
    const body = JSON.parse(fetchCall[1].body);

    expect(body.timeout).toBe(300);
    expect(body.request_timeout).toBe(300);
    expect(headers["X-Request-Timeout"]).toBe("300");
    expect(headers["Request-Timeout"]).toBe("300");
  });

  it("diagnoses and displays actionable troubleshooting when a request fails with 500 timeout", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      statusText: "Internal Server Error",
      text: () => Promise.resolve(JSON.stringify({
        error: {
          message: "LiteLLM.TimeoutError: Client timeout after 50.0s. Increase timeout or enable streaming.",
          code: 500
        }
      })),
    });
    (global as any).fetch = mockFetch;

    render(<App />);

    const modelListTextarea = screen.getByPlaceholderText(/myGemma3/i) as HTMLTextAreaElement;
    fireEvent.change(modelListTextarea, { target: { value: "local-functiongemma:270m" } });

    const generateBtn = screen.getByText("Generate");
    fireEvent.click(generateBtn);

    // Should display the 500 error and the custom Timeout badge & diagnostics
    expect(await screen.findByText(/Request Failed \(500\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Timeout \(50s\+\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Why did this fail with 500 \/ Timeout\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Enable Stream Tokens \(SSE\)/i)).toBeInTheDocument();
    expect(screen.getByText(/LiteLLM Proxy Config/i)).toBeInTheDocument();
  });

  it("allows selecting and deselecting models in the model selector modal", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      status: 200,
      json: () => Promise.resolve({
        data: [
          { id: "free" },
          { id: "myGroq" },
          { id: "new-llama-3" }
        ]
      })
    });
    (global as any).fetch = mockFetch;

    render(<App />);

    // Click "Fetch Models"
    const fetchModelsBtn = screen.getByText(/Fetch Models/i);
    fireEvent.click(fetchModelsBtn);

    // Modal should open
    expect(await screen.findByText("Select Models")).toBeInTheDocument();

    // Verify Select All and Unselect All buttons are present
    expect(screen.getByText("Select All")).toBeInTheDocument();
    expect(screen.getByText("Unselect All")).toBeInTheDocument();

    // "free" is in default list, so it should be marked as "Selected"
    const freeRow = screen.getByTestId("model-toggle-free");
    expect(freeRow).toBeInTheDocument();
    expect(freeRow).toHaveTextContent("Selected");

    // Click free to DESELECT it
    fireEvent.click(freeRow);

    // Now it should be deselected (status shows 'Add')
    expect(freeRow).toHaveTextContent("Add");

    // Click new-llama-3 to SELECT it
    const newLlamaRow = screen.getByTestId("model-toggle-new-llama-3");
    expect(newLlamaRow).toHaveTextContent("Add");
    fireEvent.click(newLlamaRow);
    expect(newLlamaRow).toHaveTextContent("Selected");

    // Test Unselect All
    const unselectAllBtn = screen.getByText("Unselect All");
    fireEvent.click(unselectAllBtn);
    expect(newLlamaRow).toHaveTextContent("Add");

    // Test Select All
    const selectAllBtn = screen.getByText("Select All");
    fireEvent.click(selectAllBtn);
    expect(newLlamaRow).toHaveTextContent("Selected");
    expect(freeRow).toHaveTextContent("Selected");
  });

  it("shuffles the model list order when Random Order is clicked", async () => {
    render(<App />);

    const modelListTextarea = screen.getByPlaceholderText(/myGemma3/i) as HTMLTextAreaElement;
    const initialList = "model-A\nmodel-B\nmodel-C\nmodel-D\nmodel-E";
    fireEvent.change(modelListTextarea, { target: { value: initialList } });

    // Mock Math.random to guarantee a predictable non-identical permutation
    const originalRandom = Math.random;
    let counter = 0;
    Math.random = () => {
      counter += 0.25;
      return counter % 1;
    };

    try {
      const randomOrderBtns = screen.getAllByRole("button", { name: /Random Order/i });
      fireEvent.click(randomOrderBtns[0]);

      // Verify that all original models are still present, but order is altered
      const newModels = modelListTextarea.value.split("\n").map(m => m.trim()).filter(Boolean);
      expect(newModels.length).toBe(5);
      expect(new Set(newModels)).toEqual(new Set(["model-A", "model-B", "model-C", "model-D", "model-E"]));
      expect(modelListTextarea.value).not.toBe(initialList);
    } finally {
      Math.random = originalRandom;
    }
  });

  it("navigates to sections when clicking Config, Prompt, History, or All without toggling visibility", () => {
    const scrollIntoViewMock = vi.fn();
    window.HTMLElement.prototype.scrollIntoView = scrollIntoViewMock;

    render(<App />);

    const configSection = document.getElementById("section-config");
    const promptSection = document.getElementById("section-prompt");
    const historySection = document.getElementById("section-history");

    expect(configSection).toBeInTheDocument();
    expect(promptSection).toBeInTheDocument();
    expect(historySection).toBeInTheDocument();

    // Find tab buttons in the view column
    const configTabBtn = screen.getByTestId("tab-config");
    const promptTabBtn = screen.getByTestId("tab-prompt");
    const historyTabBtn = screen.getByTestId("tab-history");
    const allTabBtn = screen.getByTestId("tab-all");

    expect(configTabBtn).toBeInTheDocument();
    expect(promptTabBtn).toBeInTheDocument();
    expect(historyTabBtn).toBeInTheDocument();
    expect(allTabBtn).toBeInTheDocument();

    // Click Prompt tab - navigates to section, does not hide other sections
    fireEvent.click(promptTabBtn);
    expect(promptTabBtn).toHaveClass("bg-indigo-600");
    expect(configSection).not.toHaveClass("hidden");
    expect(promptSection).not.toHaveClass("hidden");
    expect(historySection).not.toHaveClass("hidden");

    // Click History tab - navigates to section, does not hide other sections
    fireEvent.click(historyTabBtn);
    expect(historyTabBtn).toHaveClass("bg-indigo-600");
    expect(configSection).not.toHaveClass("hidden");
    expect(promptSection).not.toHaveClass("hidden");
    expect(historySection).not.toHaveClass("hidden");

    // Click Config tab - navigates to section, does not hide other sections
    fireEvent.click(configTabBtn);
    expect(configTabBtn).toHaveClass("bg-indigo-600");
    expect(configSection).not.toHaveClass("hidden");
    expect(promptSection).not.toHaveClass("hidden");
    expect(historySection).not.toHaveClass("hidden");

    // Click All tab
    fireEvent.click(allTabBtn);
    expect(allTabBtn).toHaveClass("bg-indigo-600");
    expect(configSection).not.toHaveClass("hidden");
    expect(promptSection).not.toHaveClass("hidden");
    expect(historySection).not.toHaveClass("hidden");
  });

  it("sorts network waterfall list by Name and State columns", async () => {
    const mockFetch = vi.fn().mockImplementation((url, options) => {
      const body = JSON.parse(options.body);
      const model = body.model;
      if (model === "beta-model") {
        return Promise.resolve({
          ok: true,
          status: 200,
          statusText: "OK",
          json: () => Promise.resolve({
            choices: [{ message: { content: "Beta success" } }],
            usage: { total_tokens: 30 }
          }),
        });
      }
      return Promise.reject(new Error("Alpha error"));
    });
    (global as any).fetch = mockFetch;

    render(<App />);

    const modelListTextarea = screen.getByPlaceholderText(/myGemma3/i) as HTMLTextAreaElement;
    fireEvent.change(modelListTextarea, { target: { value: "beta-model\nalpha-model" } });

    const generateBtn = screen.getByText("Generate");
    fireEvent.click(generateBtn);

    // Wait for waterfall table to render
    const nameSortBtn = await screen.findByTitle(/Click to sort by model Name/i);
    const stateSortBtn = await screen.findByTitle(/Click to sort by State/i);

    expect(nameSortBtn).toBeInTheDocument();
    expect(stateSortBtn).toBeInTheDocument();

    // Click Name sort button to sort ascending
    fireEvent.click(nameSortBtn);
    expect(screen.getByTitle(/Click to sort by model Name/i)).toBeInTheDocument();

    // Click State sort button to sort by status
    fireEvent.click(stateSortBtn);
    expect(screen.getByTitle(/Click to sort by State/i)).toBeInTheDocument();
  });

  it("toggles the left column visibility using the header button", () => {
    render(<App />);

    const toggleBtn = screen.getByTestId("toggle-left-column-btn");
    expect(toggleBtn).toBeInTheDocument();
    expect(screen.getByText("Hide Controls")).toBeInTheDocument();

    // Verify left column elements are initially visible
    expect(screen.getByTestId("tab-config")).toBeInTheDocument();

    // Click to hide left column
    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveTextContent("Show Controls");
    expect(screen.queryByTestId("tab-config")).not.toBeInTheDocument();

    // Click to restore left column
    fireEvent.click(toggleBtn);
    expect(toggleBtn).toHaveTextContent("Hide Controls");
    expect(screen.getByTestId("tab-config")).toBeInTheDocument();

    // Verify toggle visibility button inside the column div
    const colToggleBtn = screen.getByTestId("toggle-visibility-button");
    expect(colToggleBtn).toBeInTheDocument();
    fireEvent.click(colToggleBtn);
    expect(screen.queryByTestId("tab-config")).not.toBeInTheDocument();
  });

  it("toggles API Endpoint and Custom Headers fields when clicking on their labels", () => {
    render(<App />);

    // Custom Proxy Base URL input is initially visible
    const endpointInput = screen.getByPlaceholderText("http://localhost:4100/");
    expect(endpointInput).toBeInTheDocument();

    // Click API Endpoint label to toggle closed
    const endpointLabel = screen.getByText("API Endpoint");
    fireEvent.click(endpointLabel);
    expect(screen.queryByPlaceholderText("http://localhost:4100/")).not.toBeInTheDocument();

    // Click again to toggle open
    fireEvent.click(endpointLabel);
    expect(screen.getByPlaceholderText("http://localhost:4100/")).toBeInTheDocument();

    // Custom Headers textarea is initially visible
    const headersTextarea = screen.getByPlaceholderText("x-litellm-api-key: Bearer sk-1234");
    expect(headersTextarea).toBeInTheDocument();

    // Click Custom Headers label to toggle closed
    const headersLabel = screen.getByText("Custom Headers (one per line)");
    fireEvent.click(headersLabel);
    expect(screen.queryByPlaceholderText("x-litellm-api-key: Bearer sk-1234")).not.toBeInTheDocument();

    // Click again to toggle open
    fireEvent.click(headersLabel);
    expect(screen.getByPlaceholderText("x-litellm-api-key: Bearer sk-1234")).toBeInTheDocument();
  });

  it("renders history dropbox and triggers import", async () => {
    render(<App />);

    // Switch to History tab
    const historyTabBtn = screen.getByTestId("tab-history");
    fireEvent.click(historyTabBtn);

    // Verify Dropbox is present
    const dropbox = screen.getByTestId("history-dropbox");
    expect(dropbox).toBeInTheDocument();
    expect(screen.getByText(/Drag & drop history JSON, or click to browse/i)).toBeInTheDocument();

    // Verify file input exists
    const fileInput = screen.getByTestId("history-file-input") as HTMLInputElement;
    expect(fileInput).toBeInTheDocument();

    // Test drag over state on dropbox
    fireEvent.dragOver(dropbox);
    expect(screen.getByText(/Drop JSON history file here/i)).toBeInTheDocument();

    fireEvent.dragLeave(dropbox);
    expect(screen.getByText(/Drag & drop history JSON, or click to browse/i)).toBeInTheDocument();

    // Simulate uploading a JSON file via input
    const sampleHistory = [
      {
        id: "hist-101",
        timestamp: Date.now(),
        prompt: "Sample imported benchmark prompt",
        endpoint: "http://localhost:4100/v1/chat/completions",
        results: [
          {
            id: "res-1",
            modelName: "free",
            status: "success",
            output: "Great response!"
          }
        ]
      }
    ];
    const file = new File([JSON.stringify(sampleHistory)], "history.json", {
      type: "application/json",
    });

    fireEvent.change(fileInput, { target: { files: [file] } });

    // Wait for imported entry to show in list
    expect(await screen.findByText("Sample imported benchmark prompt")).toBeInTheDocument();
    expect(screen.getByText(/Imported 1 history session/i)).toBeInTheDocument();
  });

  it("supports sorting results by time or speed and provides an anchor link to the fastest result", async () => {
    let callCount = 0;
    const mockFetch = vi.fn().mockImplementation(() => {
      callCount++;
      // Model 1: slower, lower tokens/sec
      // Model 2: faster, higher tokens/sec
      const isFirst = callCount % 2 === 1;
      return Promise.resolve({
        ok: true,
        status: 200,
        statusText: "OK",
        json: () => Promise.resolve({
          choices: [{ message: { content: isFirst ? "Response from Model Alpha" : "Response from Model Beta" } }],
          usage: { prompt_tokens: 10, completion_tokens: isFirst ? 20 : 50, total_tokens: isFirst ? 30 : 60 }
        }),
      });
    });
    (global as any).fetch = mockFetch;

    render(<App />);

    // Configure two models
    const modelListTextarea = screen.getByPlaceholderText(/free/i) as HTMLTextAreaElement;
    fireEvent.change(modelListTextarea, { target: { value: "model-alpha\nmodel-beta" } });

    const generateButton = screen.getByText("Generate");
    fireEvent.click(generateButton);

    // Wait for completion of both models
    expect(await screen.findByText("Response from Model Alpha")).toBeInTheDocument();
    expect(await screen.findByText("Response from Model Beta")).toBeInTheDocument();

    // Verify Fastest result anchor link in Results header is rendered
    const fastestLink = await screen.findByTestId("fastest-result-link");
    expect(fastestLink).toBeInTheDocument();
    expect(fastestLink.tagName.toLowerCase()).toBe("a");
    expect(fastestLink.getAttribute("href")).toMatch(/^#[a-zA-Z0-9_-]+/);
    expect(fastestLink).toHaveTextContent(/Fastest:/i);

    // Verify Fastest anchor link in DevTools NetworkWaterfallPanel
    const fastestWaterfallAnchor = screen.getByTestId("fastest-result-anchor");
    expect(fastestWaterfallAnchor).toBeInTheDocument();
    expect(fastestWaterfallAnchor.getAttribute("href")).toMatch(/^#[a-zA-Z0-9_-]+/);

    // Test clicking the fastest anchor link
    fireEvent.click(fastestLink);

    // Verify Quick Sort by Time button
    const sortByTimeBtn = screen.getByTestId("quick-sort-time");
    expect(sortByTimeBtn).toBeInTheDocument();
    fireEvent.click(sortByTimeBtn);

    // Verify Quick Sort by Speed button
    const sortBySpeedBtn = screen.getByTestId("quick-sort-speed");
    expect(sortBySpeedBtn).toBeInTheDocument();
    fireEvent.click(sortBySpeedBtn);

    // Verify Time and Speed column buttons in Network Waterfall
    const sortTimeBtn = screen.getByTestId("sort-time-btn");
    const sortSpeedBtn = screen.getByTestId("sort-speed-btn");
    expect(sortTimeBtn).toBeInTheDocument();
    expect(sortSpeedBtn).toBeInTheDocument();

    fireEvent.click(sortTimeBtn);
    fireEvent.click(sortSpeedBtn);
  });

  it("opens Supabase database setup modal and allows saving configuration", () => {
    render(<App />);

    // Supabase button in header
    const supabaseBtn = screen.getByTestId("supabase-config-btn");
    expect(supabaseBtn).toBeInTheDocument();

    // Click to open modal
    fireEvent.click(supabaseBtn);

    // Verify modal title and fields
    expect(screen.getByText("Supabase Database Setup")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("https://xyzcompany.supabase.co")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("llm_tester_")).toBeInTheDocument();
    expect(screen.getByText("Insert results to Supabase after each run")).toBeInTheDocument();
    expect(screen.getByText("make supabase-init DATABASE_URL=\"postgresql://postgres:pwd@db.ref.supabase.co:5432/postgres\"")).toBeInTheDocument();

    // Enter credentials and table prefix
    const urlInput = screen.getByPlaceholderText("https://xyzcompany.supabase.co");
    const keyInput = screen.getByPlaceholderText("eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...");
    const prefixInput = screen.getByPlaceholderText("llm_tester_");
    fireEvent.change(urlInput, { target: { value: "https://my-project.supabase.co" } });
    fireEvent.change(keyInput, { target: { value: "my-anon-key-123" } });
    fireEvent.change(prefixInput, { target: { value: "llm_tester_" } });

    // Click Save Settings
    const saveBtn = screen.getByText("Save Settings");
    fireEvent.click(saveBtn);
    expect(screen.getByText("Saved!")).toBeInTheDocument();

    // Close modal
    const closeBtn = screen.getByLabelText("Close Supabase modal");
    fireEvent.click(closeBtn);
    expect(screen.queryByText("Supabase Database Setup")).not.toBeInTheDocument();
  });

  it("provides common LLM testing prompts selectbox and populates textarea", () => {
    render(<App />);

    const select = screen.getByTestId("common-prompts-select") as HTMLSelectElement;
    expect(select).toBeInTheDocument();

    // Verify key test prompts are present
    expect(screen.getByText(/Car Wash Test - Should you walk or drive\?/i)).toBeInTheDocument();
    expect(screen.getByText(/9\.9 vs 9\.11 - Which one is larger\?/i)).toBeInTheDocument();
    expect(screen.getByText(/Strawberry Test - How many r’s are in the word/i)).toBeInTheDocument();
    expect(screen.getByText(/The Missing Dollar - A classic logic puzzle involving money\./i)).toBeInTheDocument();
    expect(screen.getByText(/Word Transformation - Change one word into another/i)).toBeInTheDocument();

    // Select Car Wash Test
    fireEvent.change(select, { target: { value: "car-wash" } });
    const promptTextarea = screen.getByPlaceholderText("Enter your prompt here...") as HTMLTextAreaElement;
    expect(promptTextarea.value).toContain("car wash");

    // Select 9.9 vs 9.11
    fireEvent.change(select, { target: { value: "9-9-vs-9-11" } });
    expect(promptTextarea.value).toContain("9.9 or 9.11");

    // Select Strawberry Test
    fireEvent.change(select, { target: { value: "strawberry" } });
    expect(promptTextarea.value).toContain("strawberry");
  });

  it("switches to Model Comparison view and displays token diff side-by-side", async () => {
    // Seed history with completed results
    const sampleHistory = [
      {
        id: "hist-101",
        timestamp: Date.now() - 5000,
        prompt: "Car wash test",
        endpoint: "http://localhost:4100/v1/chat/completions",
        results: [
          {
            id: "res-a",
            modelName: "model-alpha",
            status: "success" as const,
            output: "You should drive your car to the car wash.",
            metrics: {
              durationMs: 320,
              tokensPerSecond: 120,
              totalTokens: 10,
              promptTokens: 5,
              completionTokens: 5,
              ttfbMs: 50
            }
          },
          {
            id: "res-b",
            modelName: "model-beta",
            status: "success" as const,
            output: "You must drive your vehicle into the car wash.",
            metrics: {
              durationMs: 480,
              tokensPerSecond: 95,
              totalTokens: 11,
              promptTokens: 5,
              completionTokens: 6,
              ttfbMs: 70
            }
          }
        ]
      }
    ];

    localStorage.setItem("llm_tester_history", JSON.stringify(sampleHistory));

    render(<App />);

    // Click Comparison view mode button
    const compareBtn = screen.getByTestId("empty-open-compare-btn");
    expect(compareBtn).toBeInTheDocument();
    fireEvent.click(compareBtn);

    // Verify Model Output Comparison header
    expect(screen.getByText("Model Output Comparison")).toBeInTheDocument();
    expect(screen.getByText("Side-by-Side Diff")).toBeInTheDocument();
    expect(screen.getByText("Unified Diff")).toBeInTheDocument();
    expect(screen.getByText("Raw Text")).toBeInTheDocument();

    // Verify token diff displays outputs for both models
    const outputA = screen.getByTestId("compare-output-a");
    const outputB = screen.getByTestId("compare-output-b");
    expect(outputA).toBeInTheDocument();
    expect(outputB).toBeInTheDocument();

    expect(outputA.textContent).toContain("car");
    expect(outputB.textContent).toContain("vehicle");

    // Test switching to Unified Diff mode
    const unifiedBtn = screen.getByText("Unified Diff");
    fireEvent.click(unifiedBtn);
    expect(screen.getByText("Unified Inline Diff")).toBeInTheDocument();

    // Test switching to Raw Text mode
    const rawBtn = screen.getByText("Raw Text");
    fireEvent.click(rawBtn);
    expect(screen.getByTestId("compare-output-a")).toBeInTheDocument();
  });

  it("renders 'Export to CSV' button in History section and downloads benchmark CSV", () => {
    // Seed history with benchmark runs
    const sampleHistory = [
      {
        id: "hist-csv-1",
        timestamp: 1717200000000,
        prompt: "9.9 vs 9.11 Which is larger?",
        endpoint: "http://localhost:8000/v1/chat/completions",
        results: [
          {
            id: "res-gpt",
            modelName: "gpt-4o",
            status: "success" as const,
            output: "9.9 is larger than 9.11.",
            statusCode: 200,
            metrics: {
              durationMs: 450,
              tokensPerSecond: 80.0,
              promptTokens: 10,
              completionTokens: 8,
              totalTokens: 18,
              ttfbMs: 120,
              downloadMs: 330,
              queueMs: 5,
              requestSentMs: 2
            }
          },
          {
            id: "res-claude",
            modelName: "claude-3-5-sonnet",
            status: "success" as const,
            output: "9.9 is greater because 9.9 = 9.90 > 9.11.",
            statusCode: 200,
            metrics: {
              durationMs: 520,
              tokensPerSecond: 65.0,
              promptTokens: 10,
              completionTokens: 12,
              totalTokens: 22,
              ttfbMs: 140,
              downloadMs: 380,
              queueMs: 6,
              requestSentMs: 2
            }
          }
        ]
      }
    ];

    localStorage.setItem("llm_tester_history", JSON.stringify(sampleHistory));

    // Mock document.createElement('a') and URL methods for download test
    let downloadedBlobContent = "";
    let downloadedFilename = "";

    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      if (tagName.toLowerCase() === 'a') {
        const el = originalCreateElement('a');
        el.click = vi.fn().mockImplementation(() => {
          downloadedFilename = el.getAttribute('download') || '';
        });
        return el;
      }
      return originalCreateElement(tagName);
    });

    global.URL.createObjectURL = vi.fn().mockImplementation((blob: Blob) => {
      // Store blob contents for test assertions
      const reader = new FileReader();
      reader.onload = () => {
        downloadedBlobContent = reader.result as string;
      };
      reader.readAsText(blob);
      return 'blob:http://localhost/test-csv';
    });
    global.URL.revokeObjectURL = vi.fn();

    render(<App />);

    // Switch to History section
    const historyTabBtn = screen.getByTestId("tab-history");
    fireEvent.click(historyTabBtn);

    // Verify Export to CSV button is rendered in the History section
    const exportCsvBtn = screen.getByTestId("export-csv-btn");
    expect(exportCsvBtn).toBeInTheDocument();
    expect(screen.getByText("Export to CSV")).toBeInTheDocument();

    // Click Export to CSV button
    fireEvent.click(exportCsvBtn);

    // Verify success banner/status notification appears
    expect(screen.getByText(/Exported benchmark data to CSV successfully!/i)).toBeInTheDocument();
    expect(downloadedFilename).toContain(".csv");
  });

  it("supports sort ordering (A-Z and Z-A) for model list and replaces RANDOM ORDER text with sort icon", () => {
    render(<App />);

    const modelListTextarea = screen.getByPlaceholderText(/myGemma3/i) as HTMLTextAreaElement;
    fireEvent.change(modelListTextarea, { target: { value: "zebra\napple\nmango\nbanana" } });

    // Verify the visible text "RANDOM ORDER" is NOT rendered in the document
    expect(screen.queryByText("Random Order")).not.toBeInTheDocument();
    expect(screen.queryByText("RANDOM ORDER")).not.toBeInTheDocument();

    // Verify Sort A-Z button sorts models ascending
    const sortAscBtn = screen.getByTestId("sort-models-asc-btn");
    expect(sortAscBtn).toBeInTheDocument();
    fireEvent.click(sortAscBtn);
    expect(modelListTextarea.value).toBe("apple\nbanana\nmango\nzebra");

    // Verify Sort Z-A button sorts models descending
    const sortDescBtn = screen.getByTestId("sort-models-desc-btn");
    expect(sortDescBtn).toBeInTheDocument();
    fireEvent.click(sortDescBtn);
    expect(modelListTextarea.value).toBe("zebra\nmango\nbanana\napple");

    // Verify Random Order icon button is still present and accessible
    const randomOrderBtn = screen.getByTestId("random-order-btn");
    expect(randomOrderBtn).toBeInTheDocument();
  });

  it("supports switching to sepia light, sepia dark, and greenish sepia themes", () => {
    render(<App />);

    const themeToggleBtn = screen.getByTestId("theme-toggle-btn");
    expect(themeToggleBtn).toBeInTheDocument();

    // Open theme menu
    fireEvent.click(themeToggleBtn);

    // Verify options are present: Sepia Light, Sepia Dark, Greenish Sepia
    const sepiaLightOpt = screen.getByTestId("theme-option-sepia-light");
    const sepiaDarkOpt = screen.getByTestId("theme-option-sepia-dark");
    const sepiaGreenOpt = screen.getByTestId("theme-option-sepia-green");

    expect(sepiaLightOpt).toBeInTheDocument();
    expect(sepiaDarkOpt).toBeInTheDocument();
    expect(sepiaGreenOpt).toBeInTheDocument();

    // Select Sepia Light
    fireEvent.click(sepiaLightOpt);
    expect(document.documentElement.classList.contains("theme-sepia-light")).toBe(true);

    // Reopen menu and select Sepia Dark
    fireEvent.click(themeToggleBtn);
    fireEvent.click(screen.getByTestId("theme-option-sepia-dark"));
    expect(document.documentElement.classList.contains("theme-sepia-dark")).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(true);

    // Reopen menu and select Greenish Sepia
    fireEvent.click(themeToggleBtn);
    fireEvent.click(screen.getByTestId("theme-option-sepia-green"));
    expect(document.documentElement.classList.contains("theme-sepia-green")).toBe(true);
  });

  it("supports API Base URL presets, adding new API presets, and all endpoint types", () => {
    render(<App />);

    // Check API Base URL presets
    const ollamaPreset = screen.getByTestId("preset-ollama");
    expect(ollamaPreset).toBeInTheDocument();
    fireEvent.click(ollamaPreset);

    // Proxy Base URL input should update to Ollama
    const proxyInput = screen.getByTestId("custom-proxy-base-url-input") as HTMLInputElement;
    expect(proxyInput.value).toBe("http://localhost:11434/");

    // Check target endpoint display has updated
    expect(screen.getByTestId("target-endpoint-display").textContent).toBe("http://localhost:11434/v1/chat/completions");

    // Add API base URL via Add API form
    const addApiBtn = screen.getByTestId("add-api-btn");
    fireEvent.click(addApiBtn);

    const nameInput = screen.getByTestId("new-api-name-input");
    const urlInput = screen.getByTestId("new-api-url-input");
    fireEvent.change(nameInput, { target: { value: "Custom Proxy" } });
    fireEvent.change(urlInput, { target: { value: "http://192.168.1.100:5000/" } });

    const saveBtn = screen.getByTestId("save-new-api-btn");
    fireEvent.click(saveBtn);

    // Verify proxy input updated to the newly added API
    expect(proxyInput.value).toBe("http://192.168.1.100:5000/");

    // Select Endpoint Type: /v1/embeddings
    const endpointTypeSelect = screen.getByTestId("endpoint-type-select") as HTMLSelectElement;
    fireEvent.change(endpointTypeSelect, { target: { value: "/v1/embeddings" } });
    expect(screen.getByTestId("target-endpoint-display").textContent).toBe("http://192.168.1.100:5000/v1/embeddings");

    // Select Endpoint Type: /v1/audio/speech
    fireEvent.change(endpointTypeSelect, { target: { value: "/v1/audio/speech" } });
    expect(screen.getByTestId("target-endpoint-display").textContent).toBe("http://192.168.1.100:5000/v1/audio/speech");

    // Select Custom endpoint
    fireEvent.change(endpointTypeSelect, { target: { value: "custom" } });
    const customPathInput = screen.getByTestId("custom-endpoint-path-input");
    fireEvent.change(customPathInput, { target: { value: "/v1/custom/test" } });
    expect(screen.getByTestId("target-endpoint-display").textContent).toBe("http://192.168.1.100:5000/v1/custom/test");

    // Test copy button
    const copyBtn = screen.getByTestId("copy-endpoint-btn");
    expect(copyBtn).toBeInTheDocument();
    fireEvent.click(copyBtn);
  });
});


