import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { promises as fs } from 'fs'
import path from 'path'
import { fileExists, directoryExists, readJsonFile, writeJsonFile, ensureDir } from '../../src/utils/file-utils.js'

const TEST_DIR = path.join(process.cwd(), '.test-tmp')

describe('file-utils', () => {
  beforeEach(async () => {
    await ensureDir(TEST_DIR)
  })

  afterEach(async () => {
    await fs.rm(TEST_DIR, { recursive: true, force: true })
  })

  describe('fileExists', () => {
    it('should return true for existing file', async () => {
      const filePath = path.join(TEST_DIR, 'test.txt')
      await fs.writeFile(filePath, 'test')

      const exists = await fileExists(filePath)
      expect(exists).toBe(true)
    })

    it('should return false for non-existing file', async () => {
      const filePath = path.join(TEST_DIR, 'nonexistent.txt')
      const exists = await fileExists(filePath)
      expect(exists).toBe(false)
    })
  })

  describe('directoryExists', () => {
    it('should return true for existing directory', async () => {
      const dirPath = path.join(TEST_DIR, 'testdir')
      await fs.mkdir(dirPath)

      const exists = await directoryExists(dirPath)
      expect(exists).toBe(true)
    })

    it('should return false for non-existing directory', async () => {
      const dirPath = path.join(TEST_DIR, 'nonexistent')
      const exists = await directoryExists(dirPath)
      expect(exists).toBe(false)
    })
  })

  describe('readJsonFile', () => {
    it('should read and parse JSON file', async () => {
      const filePath = path.join(TEST_DIR, 'test.json')
      const data = { foo: 'bar', baz: 123 }
      await fs.writeFile(filePath, JSON.stringify(data))

      const result = await readJsonFile<typeof data>(filePath)
      expect(result).toEqual(data)
    })
  })

  describe('writeJsonFile', () => {
    it('should write JSON file', async () => {
      const filePath = path.join(TEST_DIR, 'output.json')
      const data = { test: 'data' }

      await writeJsonFile(filePath, data)

      const content = await fs.readFile(filePath, 'utf-8')
      expect(JSON.parse(content)).toEqual(data)
    })
  })

  describe('ensureDir', () => {
    it('should create directory', async () => {
      const dirPath = path.join(TEST_DIR, 'newdir')
      await ensureDir(dirPath)

      const exists = await directoryExists(dirPath)
      expect(exists).toBe(true)
    })

    it('should create nested directories', async () => {
      const dirPath = path.join(TEST_DIR, 'a', 'b', 'c')
      await ensureDir(dirPath)

      const exists = await directoryExists(dirPath)
      expect(exists).toBe(true)
    })
  })
})
