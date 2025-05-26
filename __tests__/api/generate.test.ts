/**
 * @jest-environment node
 */

import { POST } from '@/app/api/generate/route';
import { NextRequest } from 'next/server';

// Mock fetch
global.fetch = jest.fn();

describe('/api/generate', () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  const createMockRequest = (body: any) => {
    return {
      json: jest.fn().mockResolvedValue(body),
    } as unknown as NextRequest;
  };

  test('should return 400 if required fields are missing', async () => {
    const request = createMockRequest({});
    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toContain('プロンプト、プロバイダー、APIキーが必要です');
  });

  test('should handle Claude API successfully', async () => {
    const mockClaudeResponse = {
      content: [{ text: 'Generated tourism proposal content' }],
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockClaudeResponse),
    });

    const request = createMockRequest({
      prompt: 'Test prompt',
      provider: 'claude',
      apiKey: 'test-api-key',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.content).toBe('Generated tourism proposal content');
    expect(data.provider).toBe('claude');
    expect(data.timestamp).toBeDefined();

    expect(fetch).toHaveBeenCalledWith('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': 'test-api-key',
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        messages: [
          {
            role: 'user',
            content: 'Test prompt',
          },
        ],
      }),
    });
  });

  test('should handle OpenAI API successfully', async () => {
    const mockOpenAIResponse = {
      choices: [{ message: { content: 'Generated OpenAI content' } }],
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockOpenAIResponse),
    });

    const request = createMockRequest({
      prompt: 'Test prompt',
      provider: 'openai',
      apiKey: 'test-api-key',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.content).toBe('Generated OpenAI content');
    expect(data.provider).toBe('openai');

    expect(fetch).toHaveBeenCalledWith('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer test-api-key',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'user',
            content: 'Test prompt',
          },
        ],
        max_tokens: 4000,
      }),
    });
  });

  test('should handle Azure OpenAI API with environment variables', async () => {
    // Set environment variables
    process.env.AZURE_OPENAI_ENDPOINT = 'https://test.openai.azure.com';
    process.env.AZURE_OPENAI_DEPLOYMENT = 'gpt-4-deployment';

    const mockAzureResponse = {
      choices: [{ message: { content: 'Generated Azure content' } }],
    };

    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: jest.fn().mockResolvedValue(mockAzureResponse),
    });

    const request = createMockRequest({
      prompt: 'Test prompt',
      provider: 'azure',
      apiKey: 'test-api-key',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.content).toBe('Generated Azure content');
    expect(data.provider).toBe('azure');

    expect(fetch).toHaveBeenCalledWith(
      'https://test.openai.azure.com/openai/deployments/gpt-4-deployment/chat/completions?api-version=2023-12-01-preview',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': 'test-api-key',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              content: 'Test prompt',
            },
          ],
          max_tokens: 4000,
        }),
      }
    );

    // Clean up
    delete process.env.AZURE_OPENAI_ENDPOINT;
    delete process.env.AZURE_OPENAI_DEPLOYMENT;
  });

  test('should handle Azure OpenAI API without environment variables', async () => {
    const request = createMockRequest({
      prompt: 'Test prompt',
      provider: 'azure',
      apiKey: 'test-api-key',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('Azure OpenAI の設定が不完全です');
  });

  test('should handle unsupported provider', async () => {
    const request = createMockRequest({
      prompt: 'Test prompt',
      provider: 'unsupported',
      apiKey: 'test-api-key',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('サポートされていないプロバイダーです');
  });

  test('should handle API errors', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      statusText: 'API Error',
    });

    const request = createMockRequest({
      prompt: 'Test prompt',
      provider: 'claude',
      apiKey: 'invalid-key',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toContain('Claude API エラー');
  });

  test('should handle network errors', async () => {
    (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

    const request = createMockRequest({
      prompt: 'Test prompt',
      provider: 'claude',
      apiKey: 'test-api-key',
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data.error).toBe('Network error');
  });
});