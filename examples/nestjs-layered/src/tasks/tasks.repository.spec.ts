import { TasksRepository } from './tasks.repository'
import { Task } from './entities/task.entity'
import { TaskStatus, Priority } from '../common/types'

describe('TasksRepository', () => {
  let repository: TasksRepository

  beforeEach(() => {
    repository = new TasksRepository()
  })

  describe('save', () => {
    it('should save a task', async () => {
      const task = new Task(
        'test-id',
        'Test Task',
        'Description',
        TaskStatus.TODO,
        Priority.HIGH,
        new Date(),
        new Date(),
      )

      await repository.save(task)

      const found = await repository.findById('test-id')
      expect(found).toEqual(task)
    })

    it('should overwrite existing task with same ID', async () => {
      const task1 = new Task(
        'test-id',
        'Task 1',
        'First',
        TaskStatus.TODO,
        Priority.LOW,
        new Date(),
        new Date(),
      )
      const task2 = new Task(
        'test-id',
        'Task 2',
        'Second',
        TaskStatus.DONE,
        Priority.HIGH,
        new Date(),
        new Date(),
      )

      await repository.save(task1)
      await repository.save(task2)

      const found = await repository.findById('test-id')
      expect(found?.title).toBe('Task 2')
    })
  })

  describe('findById', () => {
    it('should return task if exists', async () => {
      const task = new Task(
        'test-id',
        'Test Task',
        'Description',
        TaskStatus.TODO,
        Priority.MEDIUM,
        new Date(),
        new Date(),
      )

      await repository.save(task)

      const found = await repository.findById('test-id')
      expect(found).toEqual(task)
    })

    it('should return null if task does not exist', async () => {
      const found = await repository.findById('non-existent')
      expect(found).toBeNull()
    })
  })

  describe('findAll', () => {
    it('should return empty array when no tasks', async () => {
      const tasks = await repository.findAll()
      expect(tasks).toEqual([])
    })

    it('should return all tasks', async () => {
      const task1 = new Task(
        'id-1',
        'Task 1',
        'First',
        TaskStatus.TODO,
        Priority.LOW,
        new Date(),
        new Date(),
      )
      const task2 = new Task(
        'id-2',
        'Task 2',
        'Second',
        TaskStatus.DONE,
        Priority.HIGH,
        new Date(),
        new Date(),
      )

      await repository.save(task1)
      await repository.save(task2)

      const tasks = await repository.findAll()
      expect(tasks).toHaveLength(2)
      expect(tasks).toContainEqual(task1)
      expect(tasks).toContainEqual(task2)
    })
  })

  describe('update', () => {
    it('should update existing task', async () => {
      const task = new Task(
        'test-id',
        'Original',
        'Description',
        TaskStatus.TODO,
        Priority.LOW,
        new Date(),
        new Date(),
      )

      await repository.save(task)

      task.title = 'Updated'
      await repository.update(task)

      const found = await repository.findById('test-id')
      expect(found?.title).toBe('Updated')
    })

    it('should throw error if task does not exist', async () => {
      const task = new Task(
        'non-existent',
        'Task',
        'Desc',
        TaskStatus.TODO,
        Priority.LOW,
        new Date(),
        new Date(),
      )

      await expect(repository.update(task)).rejects.toThrow(
        'Task non-existent not found',
      )
    })
  })

  describe('delete', () => {
    it('should delete existing task', async () => {
      const task = new Task(
        'test-id',
        'Task',
        'Desc',
        TaskStatus.TODO,
        Priority.LOW,
        new Date(),
        new Date(),
      )

      await repository.save(task)
      await repository.delete('test-id')

      const found = await repository.findById('test-id')
      expect(found).toBeNull()
    })

    it('should not throw error when deleting non-existent task', async () => {
      await expect(repository.delete('non-existent')).resolves.toBeUndefined()
    })
  })

  describe('exists', () => {
    it('should return true if task exists', async () => {
      const task = new Task(
        'test-id',
        'Task',
        'Desc',
        TaskStatus.TODO,
        Priority.LOW,
        new Date(),
        new Date(),
      )

      await repository.save(task)

      const exists = await repository.exists('test-id')
      expect(exists).toBe(true)
    })

    it('should return false if task does not exist', async () => {
      const exists = await repository.exists('non-existent')
      expect(exists).toBe(false)
    })
  })
})
