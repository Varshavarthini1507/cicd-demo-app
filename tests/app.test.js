const request = require('supertest');
const app = require('../src/app');

describe('Health endpoint', () => {
  it('returns UP', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('UP');
  });
});

describe('Tasks API', () => {
  it('creates a task', async () => {
    const res = await request(app).post('/api/tasks').send({ title: 'Write report' });
    expect(res.statusCode).toBe(201);
    expect(res.body.title).toBe('Write report');
  });

  it('rejects an empty title', async () => {
    const res = await request(app).post('/api/tasks').send({});
    expect(res.statusCode).toBe(400);
  });

  it('lists tasks', async () => {
    const res = await request(app).get('/api/tasks');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('deletes a task', async () => {
    const created = await request(app).post('/api/tasks').send({ title: 'Temp' });
    const res = await request(app).delete(`/api/tasks/${created.body.id}`);
    expect(res.statusCode).toBe(204);
  });

  it('returns 404 for a missing task', async () => {
    const res = await request(app).delete('/api/tasks/9999');
    expect(res.statusCode).toBe(404);
  });
});
