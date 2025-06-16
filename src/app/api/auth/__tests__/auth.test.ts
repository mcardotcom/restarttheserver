import { createMocks } from 'node-mocks-http'
import { signIn, signOut } from '../route'
import { createClient } from '@supabase/supabase-js'

// Mock Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    auth: {
      signInWithPassword: jest.fn(),
      signOut: jest.fn(),
    },
  })),
}))

describe('Auth API Routes', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/auth/signin', () => {
    it('should return 400 if email or password is missing', async () => {
      const { req, res } = createMocks({
        method: 'POST',
        body: {},
      })

      await signIn(req)

      expect(res._getStatusCode()).toBe(400)
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Email and password are required',
      })
    })

    it('should return 401 for invalid credentials', async () => {
      const mockSupabase = createClient('', '')
      mockSupabase.auth.signInWithPassword = jest.fn().mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid login credentials' },
      })

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: 'wrongpassword',
        },
      })

      await signIn(req)

      expect(res._getStatusCode()).toBe(401)
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Invalid login credentials',
      })
    })

    it('should return 200 and user data for valid credentials', async () => {
      const mockUser = {
        id: '123',
        email: 'test@example.com',
        role: 'admin',
      }

      const mockSupabase = createClient('', '')
      mockSupabase.auth.signInWithPassword = jest.fn().mockResolvedValue({
        data: { user: mockUser },
        error: null,
      })

      const { req, res } = createMocks({
        method: 'POST',
        body: {
          email: 'test@example.com',
          password: 'correctpassword',
        },
      })

      await signIn(req)

      expect(res._getStatusCode()).toBe(200)
      expect(JSON.parse(res._getData())).toEqual({
        user: mockUser,
      })
    })
  })

  describe('POST /api/auth/signout', () => {
    it('should return 200 on successful signout', async () => {
      const mockSupabase = createClient('', '')
      mockSupabase.auth.signOut = jest.fn().mockResolvedValue({
        error: null,
      })

      const { req, res } = createMocks({
        method: 'POST',
      })

      await signOut(req)

      expect(res._getStatusCode()).toBe(200)
      expect(JSON.parse(res._getData())).toEqual({
        message: 'Signed out successfully',
      })
    })

    it('should return 500 if signout fails', async () => {
      const mockSupabase = createClient('', '')
      mockSupabase.auth.signOut = jest.fn().mockResolvedValue({
        error: { message: 'Signout failed' },
      })

      const { req, res } = createMocks({
        method: 'POST',
      })

      await signOut(req)

      expect(res._getStatusCode()).toBe(500)
      expect(JSON.parse(res._getData())).toEqual({
        error: 'Signout failed',
      })
    })
  })
}) 