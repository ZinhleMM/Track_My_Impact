/*
CM3070 Computer Science Final Project Track My Impact: Data Driven Waste Management
BSc Computer Science, Goldsmiths, University of London
CM3070 Final Project in Data Science (CM3050)
with Extended Features in Machine Learning and Neural Networks (CM3015) and Databases and Advanced Data Techniques (CM3010)
by
Zinhle Maurice-Mopp (210125870)
zm140@student.london.ac.uk

AIClassification.test.tsx: Test suite for AI-powered waste classification component
*/
// Test suite for AI classification functionality

import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import '@testing-library/jest-dom';
import AIClassification from "@/components/AIClassification";

const mockClassifyWasteApi = jest.fn();

jest.mock("@/lib/api", () => ({
  classifyWaste: (...args: unknown[]) => mockClassifyWasteApi(...args),
}));

const mockRunClassifier = jest.fn();
const mockIsModelAvailable = jest.fn();
const mockGetModelStatus = jest.fn();

jest.mock("@/utils/model-loader", () => ({
  classifyWaste: (...args: unknown[]) => mockRunClassifier(...args),
  isModelAvailable: (...args: unknown[]) => mockIsModelAvailable(...args),
  getModelStatus: (...args: unknown[]) => mockGetModelStatus(...args),
}));

describe("AIClassification", () => {
  beforeEach(() => {
    mockClassifyWasteApi.mockResolvedValue({ impact_value: 1.5, nudge_text: "Great job!" });
    mockRunClassifier.mockResolvedValue([]);
    mockIsModelAvailable.mockResolvedValue(false);
    mockGetModelStatus.mockReturnValue("Model unavailable - using fallback");
    jest.spyOn(Math, "random").mockReturnValue(0);
  });

  afterEach(() => {
    jest.resetAllMocks();
    (Math.random as jest.MockedFunction<typeof Math.random>).mockRestore();
  });

  function uploadSample() {
    const file = new File(["sample"], "bottle.png", { type: "image/png" });
    const input = screen.getByLabelText(/upload waste image/i) as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });
  }

  test("shows uncertain classification warning when confidence is below threshold", async () => {
    render(<AIClassification onItemLogged={jest.fn()} storageKey="test-key" />);

    uploadSample();

    fireEvent.click(screen.getByRole("button", { name: /classify image/i }));

    await waitFor(() => expect(screen.getByText(/classification complete/i)).toBeInTheDocument());

    expect(screen.getByText(/uncertain classification/i)).toBeInTheDocument();
  });

  test("blocks logging until a disposal method is selected", async () => {
    render(<AIClassification onItemLogged={jest.fn()} storageKey="test-key" />);

    uploadSample();

    fireEvent.click(screen.getByRole("button", { name: /classify image/i }));

    await waitFor(() => expect(screen.getByText(/classification complete/i)).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /log impact/i }));

    expect(screen.getByText(/select a disposal method/i)).toBeInTheDocument();
    expect(mockClassifyWasteApi).not.toHaveBeenCalled();
  });
});
