export interface TourismResource {
  name: string;
  priority: 'high' | 'medium' | 'low';
  attractiveness: 1 | 2 | 3 | 4 | 5;
  uniqueKeyword: string;
}

export interface FormData {
  regionName: string;
  resources: TourismResource[];
  targetCustomers: string;
  tourConcept: string;
  subsidyPrograms: string[];
  initialInvestment: number;
  revenueEstimate: string;
  managementStructure: string;
  additionalNotes?: string;
}

export interface LLMProvider {
  id: string;
  name: string;
  enabled: boolean;
}

export interface GenerationResult {
  content: string;
  provider: string;
  timestamp: Date;
}

export interface SavedProject {
  id: string;
  name: string;
  formData: FormData;
  createdAt: Date;
  updatedAt: Date;
}