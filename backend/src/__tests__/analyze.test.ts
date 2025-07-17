import request from 'supertest';
import app from '../server';
import path from 'path';
import fs from 'fs';

describe('Analyze API', () => {
  const validImage = 'receipt1.JPG';
  const datasetPath = path.join(__dirname, '../../../dataset', validImage);

  it('should analyze a valid receipt image and return itemized results', async () => {
    // Ensure the test image exists
    expect(fs.existsSync(datasetPath)).toBe(true);
    const response = await request(app)
      .post('/api/analyze')
      .send({ imagePath: validImage })
      .expect(200);
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('analysis');
    expect(response.body).toHaveProperty('imagePath', validImage);
    expect(typeof response.body.analysis).toBe('string');
    // Optionally, check for keywords in the analysis
    expect(response.body.analysis.toLowerCase()).toMatch(/total|item/i);
  });

  it('should return 404 for a non-existent image', async () => {
    const response = await request(app)
      .post('/api/analyze')
      .send({ imagePath: 'nonexistent.jpg' })
      .expect(404);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toMatch(/not found/i);
  });

  it('should return 400 for missing imagePath', async () => {
    const response = await request(app)
      .post('/api/analyze')
      .send({})
      .expect(400);
    expect(response.body).toHaveProperty('error');
    expect(response.body.error).toMatch(/image path is required/i);
  });
}); 