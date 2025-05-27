import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { prompt, provider, apiKey } = await request.json();

    if (!prompt || !provider || !apiKey) {
      return NextResponse.json(
        { error: 'プロンプト、プロバイダー、APIキーが必要です' },
        { status: 400 }
      );
    }

    let response;
    let generatedContent;

    switch (provider) {
      case 'claude':
        response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-3-sonnet-20240229',
            max_tokens: 4000,
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
          }),
        });

        if (!response.ok) {
          throw new Error(`Claude API エラー: ${response.statusText}`);
        }

        const claudeData = await response.json();
        generatedContent = claudeData.content[0].text;
        break;

      case 'openai':
        response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              {
                role: 'user',
                content: prompt,
              },
            ],
            max_tokens: 4000,
          }),
        });

        if (!response.ok) {
          throw new Error(`OpenAI API エラー: ${response.statusText}`);
        }

        const openaiData = await response.json();
        generatedContent = openaiData.choices[0].message.content;
        break;

      case 'azure':
        // Azure OpenAI Service用の実装
        const azureEndpoint = process.env.AZURE_OPENAI_ENDPOINT;
        const azureDeployment = process.env.AZURE_OPENAI_DEPLOYMENT;
        
        if (!azureEndpoint || !azureDeployment) {
          throw new Error('Azure OpenAI の設定が不完全です');
        }

        response = await fetch(
          `${azureEndpoint}/openai/deployments/${azureDeployment}/chat/completions?api-version=2023-12-01-preview`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'api-key': apiKey,
            },
            body: JSON.stringify({
              messages: [
                {
                  role: 'user',
                  content: prompt,
                },
              ],
              max_tokens: 4000,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(`Azure OpenAI API エラー: ${response.statusText}`);
        }

        const azureData = await response.json();
        generatedContent = azureData.choices[0].message.content;
        break;

      default:
        return NextResponse.json(
          { error: 'サポートされていないプロバイダーです' },
          { status: 400 }
        );
    }

    return NextResponse.json({
      content: generatedContent,
      provider,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : '生成に失敗しました' },
      { status: 500 }
    );
  }
}