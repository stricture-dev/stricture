import { Test, TestingModule } from '@nestjs/testing'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import * as request from 'supertest'
import { AppModule } from '../src/app.module'
import { Priority, TaskStatus } from '../src/common/types'

describe('Tasks API (e2e)', () => {
  let app: INestApplication

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile()

    app = moduleFixture.createNestApplication()

    // Apply same validation pipes as production
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    )

    await app.init()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('POST /tasks', () => {
    it('should create a new task', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .send({
          title: 'Test Task',
          description: 'Test Description',
          priority: Priority.HIGH,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.id).toBeDefined()
          expect(res.body.title).toBe('Test Task')
          expect(res.body.description).toBe('Test Description')
          expect(res.body.priority).toBe(Priority.HIGH)
          expect(res.body.status).toBe(TaskStatus.TODO)
          expect(res.body.createdAt).toBeDefined()
          expect(res.body.updatedAt).toBeDefined()
        })
    })

    it('should create task without description', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .send({
          title: 'Minimal Task',
          priority: Priority.LOW,
        })
        .expect(201)
        .expect((res) => {
          expect(res.body.title).toBe('Minimal Task')
          expect(res.body.description).toBe('')
        })
    })

    it('should reject task without title', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .send({
          priority: Priority.MEDIUM,
        })
        .expect(400)
    })

    it('should reject task with invalid priority', () => {
      return request(app.getHttpServer())
        .post('/tasks')
        .send({
          title: 'Task',
          priority: 'invalid',
        })
        .expect(400)
    })
  })

  describe('GET /tasks', () => {
    it('should return all tasks', async () => {
      // Create some tasks first
      await request(app.getHttpServer()).post('/tasks').send({
        title: 'Task 1',
        priority: Priority.LOW,
      })

      await request(app.getHttpServer()).post('/tasks').send({
        title: 'Task 2',
        priority: Priority.HIGH,
      })

      return request(app.getHttpServer())
        .get('/tasks')
        .expect(200)
        .expect((res) => {
          expect(Array.isArray(res.body)).toBe(true)
          expect(res.body.length).toBeGreaterThanOrEqual(2)
        })
    })
  })

  describe('GET /tasks/:id', () => {
    it('should return task by ID', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/tasks')
        .send({
          title: 'Specific Task',
          priority: Priority.MEDIUM,
        })

      const taskId = createRes.body.id

      return request(app.getHttpServer())
        .get(`/tasks/${taskId}`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(taskId)
          expect(res.body.title).toBe('Specific Task')
        })
    })

    it('should return 404 for non-existent task', () => {
      return request(app.getHttpServer())
        .get('/tasks/non-existent-id')
        .expect(404)
    })
  })

  describe('PUT /tasks/:id', () => {
    it('should update task', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/tasks')
        .send({
          title: 'Original Title',
          description: 'Original Description',
          priority: Priority.LOW,
        })

      const taskId = createRes.body.id

      return request(app.getHttpServer())
        .put(`/tasks/${taskId}`)
        .send({
          title: 'Updated Title',
          priority: Priority.HIGH,
        })
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(taskId)
          expect(res.body.title).toBe('Updated Title')
          expect(res.body.priority).toBe(Priority.HIGH)
          // Description should remain unchanged
          expect(res.body.description).toBe('Original Description')
        })
    })

    it('should return 404 for non-existent task', () => {
      return request(app.getHttpServer())
        .put('/tasks/non-existent-id')
        .send({
          title: 'Updated',
        })
        .expect(404)
    })
  })

  describe('DELETE /tasks/:id', () => {
    it('should delete task', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/tasks')
        .send({
          title: 'Task to Delete',
          priority: Priority.LOW,
        })

      const taskId = createRes.body.id

      await request(app.getHttpServer())
        .delete(`/tasks/${taskId}`)
        .expect(204)

      // Verify task is deleted
      return request(app.getHttpServer()).get(`/tasks/${taskId}`).expect(404)
    })

    it('should return 404 for non-existent task', () => {
      return request(app.getHttpServer())
        .delete('/tasks/non-existent-id')
        .expect(404)
    })
  })

  describe('PATCH /tasks/:id/complete', () => {
    it('should mark task as complete', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/tasks')
        .send({
          title: 'Task to Complete',
          priority: Priority.MEDIUM,
        })

      const taskId = createRes.body.id

      return request(app.getHttpServer())
        .patch(`/tasks/${taskId}/complete`)
        .expect(200)
        .expect((res) => {
          expect(res.body.id).toBe(taskId)
          expect(res.body.status).toBe(TaskStatus.DONE)
        })
    })

    it('should reject completing already completed task', async () => {
      const createRes = await request(app.getHttpServer())
        .post('/tasks')
        .send({
          title: 'Task',
          priority: Priority.LOW,
        })

      const taskId = createRes.body.id

      // Complete once
      await request(app.getHttpServer())
        .patch(`/tasks/${taskId}/complete`)
        .expect(200)

      // Try to complete again
      return request(app.getHttpServer())
        .patch(`/tasks/${taskId}/complete`)
        .expect(400)
    })

    it('should return 404 for non-existent task', () => {
      return request(app.getHttpServer())
        .patch('/tasks/non-existent-id/complete')
        .expect(404)
    })
  })
})
