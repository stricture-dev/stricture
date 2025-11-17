import { Test, TestingModule } from '@nestjs/testing'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { TasksService } from './tasks.service'
import { TasksRepository } from './tasks.repository'
import { TaskStatus, Priority } from '../common/types'

describe('TasksService', () => {
  let service: TasksService

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TasksService, TasksRepository],
    }).compile()

    service = module.get<TasksService>(TasksService)
  })

  describe('create', () => {
    it('should create a task successfully', async () => {
      const createDto = {
        title: 'Test Task',
        description: 'Test Description',
        priority: Priority.HIGH,
      }

      const result = await service.create(createDto)

      expect(result.title).toBe('Test Task')
      expect(result.description).toBe('Test Description')
      expect(result.priority).toBe(Priority.HIGH)
      expect(result.status).toBe(TaskStatus.TODO)
      expect(result.id).toBeDefined()
    })

    it('should create task without description', async () => {
      const createDto = {
        title: 'Test Task',
        priority: Priority.LOW,
      }

      const result = await service.create(createDto)

      expect(result.title).toBe('Test Task')
      expect(result.description).toBe('')
      expect(result.priority).toBe(Priority.LOW)
    })

    it('should reject empty title', async () => {
      const createDto = {
        title: '   ',
        priority: Priority.MEDIUM,
      }

      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      )
      await expect(service.create(createDto)).rejects.toThrow(
        'Title cannot be empty',
      )
    })
  })

  describe('findAll', () => {
    it('should return empty array when no tasks', async () => {
      const result = await service.findAll()
      expect(result).toEqual([])
    })

    it('should return all tasks', async () => {
      await service.create({
        title: 'Task 1',
        priority: Priority.LOW,
      })
      await service.create({
        title: 'Task 2',
        priority: Priority.HIGH,
      })

      const result = await service.findAll()

      expect(result).toHaveLength(2)
      expect(result[0].title).toBe('Task 1')
      expect(result[1].title).toBe('Task 2')
    })
  })

  describe('findOne', () => {
    it('should return task by ID', async () => {
      const created = await service.create({
        title: 'Test Task',
        priority: Priority.MEDIUM,
      })

      const result = await service.findOne(created.id)

      expect(result.id).toBe(created.id)
      expect(result.title).toBe('Test Task')
    })

    it('should throw NotFoundException for non-existent task', async () => {
      await expect(service.findOne('non-existent')).rejects.toThrow(
        NotFoundException,
      )
      await expect(service.findOne('non-existent')).rejects.toThrow(
        'Task with ID non-existent not found',
      )
    })
  })

  describe('update', () => {
    it('should update task successfully', async () => {
      const created = await service.create({
        title: 'Original Title',
        priority: Priority.LOW,
      })

      const result = await service.update(created.id, {
        title: 'Updated Title',
        priority: Priority.HIGH,
      })

      expect(result.id).toBe(created.id)
      expect(result.title).toBe('Updated Title')
      expect(result.priority).toBe(Priority.HIGH)
    })

    it('should update only provided fields', async () => {
      const created = await service.create({
        title: 'Original Title',
        description: 'Original Description',
        priority: Priority.LOW,
      })

      const result = await service.update(created.id, {
        title: 'Updated Title',
      })

      expect(result.title).toBe('Updated Title')
      expect(result.description).toBe('Original Description')
      expect(result.priority).toBe(Priority.LOW)
    })

    it('should reject empty title', async () => {
      const created = await service.create({
        title: 'Original',
        priority: Priority.LOW,
      })

      await expect(
        service.update(created.id, { title: '   ' }),
      ).rejects.toThrow(BadRequestException)
      await expect(
        service.update(created.id, { title: '   ' }),
      ).rejects.toThrow('Title cannot be empty')
    })

    it('should throw NotFoundException for non-existent task', async () => {
      await expect(
        service.update('non-existent', { title: 'New' }),
      ).rejects.toThrow(NotFoundException)
    })
  })

  describe('remove', () => {
    it('should delete task successfully', async () => {
      const created = await service.create({
        title: 'Task to delete',
        priority: Priority.LOW,
      })

      await service.remove(created.id)

      await expect(service.findOne(created.id)).rejects.toThrow(
        NotFoundException,
      )
    })

    it('should throw NotFoundException for non-existent task', async () => {
      await expect(service.remove('non-existent')).rejects.toThrow(
        NotFoundException,
      )
    })
  })

  describe('complete', () => {
    it('should mark task as complete', async () => {
      const created = await service.create({
        title: 'Task to complete',
        priority: Priority.MEDIUM,
      })

      const result = await service.complete(created.id)

      expect(result.id).toBe(created.id)
      expect(result.status).toBe(TaskStatus.DONE)
    })

    it('should reject completing already completed task', async () => {
      const created = await service.create({
        title: 'Task',
        priority: Priority.LOW,
      })

      await service.complete(created.id)

      await expect(service.complete(created.id)).rejects.toThrow(
        BadRequestException,
      )
      await expect(service.complete(created.id)).rejects.toThrow(
        'Task is already completed',
      )
    })

    it('should throw NotFoundException for non-existent task', async () => {
      await expect(service.complete('non-existent')).rejects.toThrow(
        NotFoundException,
      )
    })
  })
})
