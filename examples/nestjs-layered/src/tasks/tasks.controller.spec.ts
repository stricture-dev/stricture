import { Test, TestingModule } from '@nestjs/testing'
import { TasksController } from './tasks.controller'
import { TasksService } from './tasks.service'
import { Priority, TaskStatus } from '../common/types'

describe('TasksController', () => {
  let controller: TasksController
  let service: TasksService

  const mockTasksService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    complete: jest.fn(),
  }

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TasksController],
      providers: [
        {
          provide: TasksService,
          useValue: mockTasksService,
        },
      ],
    }).compile()

    controller = module.get<TasksController>(TasksController)
    service = module.get<TasksService>(TasksService)

    // Clear all mocks between tests
    jest.clearAllMocks()
  })

  describe('create', () => {
    it('should create a task', async () => {
      const createDto = {
        title: 'Test Task',
        description: 'Test Description',
        priority: Priority.HIGH,
      }

      const expectedResult = {
        id: 'test-id',
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.TODO,
        priority: Priority.HIGH,
        createdAt: '2025-11-16T10:00:00.000Z',
        updatedAt: '2025-11-16T10:00:00.000Z',
      }

      mockTasksService.create.mockResolvedValue(expectedResult)

      const result = await controller.create(createDto)

      expect(result).toEqual(expectedResult)
      expect(service.create).toHaveBeenCalledWith(createDto)
      expect(service.create).toHaveBeenCalledTimes(1)
    })
  })

  describe('findAll', () => {
    it('should return an array of tasks', async () => {
      const expectedResult = [
        {
          id: 'id-1',
          title: 'Task 1',
          description: 'Desc 1',
          status: TaskStatus.TODO,
          priority: Priority.LOW,
          createdAt: '2025-11-16T10:00:00.000Z',
          updatedAt: '2025-11-16T10:00:00.000Z',
        },
        {
          id: 'id-2',
          title: 'Task 2',
          description: 'Desc 2',
          status: TaskStatus.DONE,
          priority: Priority.HIGH,
          createdAt: '2025-11-16T10:00:00.000Z',
          updatedAt: '2025-11-16T10:00:00.000Z',
        },
      ]

      mockTasksService.findAll.mockResolvedValue(expectedResult)

      const result = await controller.findAll()

      expect(result).toEqual(expectedResult)
      expect(service.findAll).toHaveBeenCalledTimes(1)
    })

    it('should return empty array when no tasks', async () => {
      mockTasksService.findAll.mockResolvedValue([])

      const result = await controller.findAll()

      expect(result).toEqual([])
    })
  })

  describe('findOne', () => {
    it('should return a single task', async () => {
      const expectedResult = {
        id: 'test-id',
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.TODO,
        priority: Priority.MEDIUM,
        createdAt: '2025-11-16T10:00:00.000Z',
        updatedAt: '2025-11-16T10:00:00.000Z',
      }

      mockTasksService.findOne.mockResolvedValue(expectedResult)

      const result = await controller.findOne('test-id')

      expect(result).toEqual(expectedResult)
      expect(service.findOne).toHaveBeenCalledWith('test-id')
      expect(service.findOne).toHaveBeenCalledTimes(1)
    })
  })

  describe('update', () => {
    it('should update a task', async () => {
      const updateDto = {
        title: 'Updated Title',
        priority: Priority.HIGH,
      }

      const expectedResult = {
        id: 'test-id',
        title: 'Updated Title',
        description: 'Original Description',
        status: TaskStatus.TODO,
        priority: Priority.HIGH,
        createdAt: '2025-11-16T10:00:00.000Z',
        updatedAt: '2025-11-16T10:05:00.000Z',
      }

      mockTasksService.update.mockResolvedValue(expectedResult)

      const result = await controller.update('test-id', updateDto)

      expect(result).toEqual(expectedResult)
      expect(service.update).toHaveBeenCalledWith('test-id', updateDto)
      expect(service.update).toHaveBeenCalledTimes(1)
    })
  })

  describe('remove', () => {
    it('should delete a task', async () => {
      mockTasksService.remove.mockResolvedValue(undefined)

      const result = await controller.remove('test-id')

      expect(result).toBeUndefined()
      expect(service.remove).toHaveBeenCalledWith('test-id')
      expect(service.remove).toHaveBeenCalledTimes(1)
    })
  })

  describe('complete', () => {
    it('should mark task as complete', async () => {
      const expectedResult = {
        id: 'test-id',
        title: 'Test Task',
        description: 'Test Description',
        status: TaskStatus.DONE,
        priority: Priority.LOW,
        createdAt: '2025-11-16T10:00:00.000Z',
        updatedAt: '2025-11-16T10:10:00.000Z',
      }

      mockTasksService.complete.mockResolvedValue(expectedResult)

      const result = await controller.complete('test-id')

      expect(result).toEqual(expectedResult)
      expect(result.status).toBe(TaskStatus.DONE)
      expect(service.complete).toHaveBeenCalledWith('test-id')
      expect(service.complete).toHaveBeenCalledTimes(1)
    })
  })
})
