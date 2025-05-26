import { test, expect } from '@playwright/test';

test.describe('Tourism Proposal Generator E2E Tests', () => {
  test('should complete full workflow from input to generation', async ({ page }) => {
    await page.goto('/');

    // Check page title and header
    await expect(page).toHaveTitle(/観光事業計画書ジェネレーター/);
    await expect(page.getByRole('heading', { name: '観光事業計画書ジェネレーター' })).toBeVisible();

    // Open settings panel
    await page.getByRole('button').filter({ hasText: 'Settings' }).click();
    
    // Set API key (mock)
    await page.getByPlaceholder('APIキーを入力してください').fill('test-api-key-mock');
    
    // Select LLM provider
    await page.getByLabel('LLMプロバイダー').selectOption('claude');

    // Fill in basic form fields
    await page.getByPlaceholder('例：熊野古道周辺地域').fill('熊野古道周辺地域');
    await page.getByPlaceholder('例：富裕層インバウンド、教育旅行').fill('富裕層インバウンド');
    await page.getByPlaceholder('例：再生型エコツーリズム×ガストロノミー').fill('再生型エコツーリズム×ガストロノミー');
    
    // Add tourism resources
    await page.getByText('資源を追加').click();
    
    // Fill in first resource
    await page.getByPlaceholder('例：滝と渓流').fill('滝と渓流');
    await page.locator('select').filter({ hasText: '高中低' }).selectOption('high');
    await page.locator('select').filter({ hasText: '★★★★★ (5)★★★★ (4)★★★ (3)★★ (2)★ (1)' }).selectOption('5');
    await page.getByPlaceholder('例：未開発エリア').fill('未開発エリア');

    // Add subsidy program
    await page.getByPlaceholder('補助金名を入力してEnterまたは追加ボタンをクリック').fill('観光庁補助金A');
    await page.getByText('追加', { exact: true }).click();

    // Fill in remaining fields
    await page.getByPlaceholder('例：5000').fill('5000');
    await page.getByPlaceholder('例：体験 8万円 / 宿泊 5万円').fill('体験 8万円 / 宿泊 5万円');
    await page.getByPlaceholder('例：既存DMO・自治体連携').fill('既存DMO・自治体連携');
    await page.getByPlaceholder('深掘りしてほしい要素や特殊条件があれば記入してください').fill('環境配慮を重視');

    // Check that generate button is enabled
    await expect(page.getByRole('button', { name: '計画書を生成' })).toBeEnabled();

    // Note: We don't actually click generate as it would require real API calls
    // In a real test environment, you would mock the API responses
  });

  test('should handle project saving and loading', async ({ page }) => {
    await page.goto('/');

    // Fill in some basic data
    await page.getByPlaceholder('例：熊野古道周辺地域').fill('テストプロジェクト地域');
    await page.getByPlaceholder('例：富裕層インバウンド、教育旅行').fill('テスト顧客層');

    // Save project
    await page.getByText('現在の入力を保存').click();
    await page.getByPlaceholder('プロジェクト名を入力').fill('テストプロジェクト');
    await page.getByRole('button', { name: '保存' }).click();

    // Check that project appears in saved projects
    await expect(page.getByText('テストプロジェクト')).toBeVisible();

    // Clear form
    await page.getByPlaceholder('例：熊野古道周辺地域').fill('');
    await page.getByPlaceholder('例：富裕層インバウンド、教育旅行').fill('');

    // Load project
    await page.getByRole('button', { name: '読み込み' }).click();

    // Check that data is restored
    await expect(page.getByDisplayValue('テストプロジェクト地域')).toBeVisible();
    await expect(page.getByDisplayValue('テスト顧客層')).toBeVisible();
  });

  test('should handle resource management', async ({ page }) => {
    await page.goto('/');

    // Initially no resources
    await expect(page.getByText('「資源を追加」ボタンをクリックして')).toBeVisible();

    // Add first resource
    await page.getByText('資源を追加').click();
    await expect(page.getByText('資源 1')).toBeVisible();

    // Fill in resource details
    await page.getByPlaceholder('例：滝と渓流').fill('第一の資源');
    await page.getByPlaceholder('例：未開発エリア').fill('キーワード1');

    // Add second resource
    await page.getByText('資源を追加').click();
    await expect(page.getByText('資源 2')).toBeVisible();

    // Fill in second resource
    await page.locator('input[placeholder="例：滝と渓流"]').nth(1).fill('第二の資源');
    await page.locator('input[placeholder="例：未開発エリア"]').nth(1).fill('キーワード2');

    // Check both resources are present
    await expect(page.getByDisplayValue('第一の資源')).toBeVisible();
    await expect(page.getByDisplayValue('第二の資源')).toBeVisible();

    // Remove first resource
    await page.locator('[data-testid="delete-resource"]').first().click();

    // Check that only second resource remains
    await expect(page.getByDisplayValue('第一の資源')).not.toBeVisible();
    await expect(page.getByDisplayValue('第二の資源')).toBeVisible();
    await expect(page.getByText('資源 1')).toBeVisible(); // Should be renumbered
  });

  test('should validate required fields', async ({ page }) => {
    await page.goto('/');

    // Open settings and set API key
    await page.getByRole('button').filter({ hasText: 'Settings' }).click();
    await page.getByPlaceholder('APIキーを入力してください').fill('test-api-key');

    // Try to generate without required fields
    const generateButton = page.getByRole('button', { name: '計画書を生成' });
    await generateButton.click();

    // Should show validation message
    page.on('dialog', dialog => {
      expect(dialog.message()).toContain('地域名を入力してください');
      dialog.accept();
    });
  });

  test('should be responsive on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');

    // Check that layout adapts to mobile
    await expect(page.getByRole('heading', { name: '観光事業計画書ジェネレーター' })).toBeVisible();
    
    // Form should be stacked vertically on mobile
    const form = page.locator('.card').first();
    await expect(form).toBeVisible();

    // Settings panel should still be accessible
    await page.getByRole('button').filter({ hasText: 'Settings' }).click();
    await expect(page.getByLabel('LLMプロバイダー')).toBeVisible();
  });

  test('should handle subsidy input correctly', async ({ page }) => {
    await page.goto('/');

    // Add multiple subsidies
    const subsidyInput = page.getByPlaceholder('補助金名を入力してEnterまたは追加ボタンをクリック');
    const addButton = page.getByText('追加', { exact: true });

    // Add first subsidy
    await subsidyInput.fill('観光庁補助金A');
    await addButton.click();
    await expect(page.getByText('観光庁補助金A')).toBeVisible();

    // Add second subsidy
    await subsidyInput.fill('地方創生推進交付金');
    await addButton.click();
    await expect(page.getByText('地方創生推進交付金')).toBeVisible();

    // Add subsidy with Enter key
    await subsidyInput.fill('その他の補助金');
    await subsidyInput.press('Enter');
    await expect(page.getByText('その他の補助金')).toBeVisible();

    // Remove a subsidy
    await page.getByText('観光庁補助金A').locator('..').getByRole('button').click();
    await expect(page.getByText('観光庁補助金A')).not.toBeVisible();
    await expect(page.getByText('地方創生推進交付金')).toBeVisible();
    await expect(page.getByText('その他の補助金')).toBeVisible();
  });
});