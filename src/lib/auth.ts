// Production Authentication System for RelationshipOS
// Multi-tenant user management with organizations

import { supabase } from './supabase';
import { cookies } from 'next/headers';

// Types for authentication
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  organizationId: string;
  role: 'owner' | 'admin' | 'member';
  isEmailVerified: boolean;
  createdAt: string;
  lastLoginAt: string;
}

export interface Organization {
  id: string;
  name: string;
  domain?: string;
  subscriptionStatus: 'trial' | 'active' | 'past_due' | 'canceled';
  subscriptionTier: 'personal_pro' | 'business' | 'enterprise';
  trialEndsAt?: string;
  createdAt: string;
  ownerId: string;
}

export interface AuthSession {
  user: User;
  organization: Organization;
  token: string;
  expiresAt: number;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  organizationName: string;
  organizationDomain?: string;
}

// Authentication service class
export class AuthService {
  private static instance: AuthService;
  
  static getInstance(): AuthService {
    if (!AuthService.instance) {
      AuthService.instance = new AuthService();
    }
    return AuthService.instance;
  }

  // Simple password hashing using Web Crypto API
  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + process.env.AUTH_SALT);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  // Verify password against hash
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const passwordHash = await this.hashPassword(password);
    return passwordHash === hash;
  }

  // Generate JWT-like token (simplified for now)
  generateToken(userId: string, organizationId: string): string {
    const payload = {
      userId,
      organizationId,
      iat: Date.now(),
      exp: Date.now() + (7 * 24 * 60 * 60 * 1000) // 7 days
    };
    return Buffer.from(JSON.stringify(payload)).toString('base64');
  }

  // Verify and decode token
  verifyToken(token: string): { userId: string; organizationId: string; exp: number } | null {
    try {
      const payload = JSON.parse(Buffer.from(token, 'base64').toString());
      if (payload.exp < Date.now()) {
        return null; // Token expired
      }
      return payload;
    } catch {
      return null;
    }
  }

  // Register new user and organization
  async register(data: RegisterData): Promise<{ user: User; organization: Organization; token: string }> {
    if (!supabase) {
      throw new Error('Database not configured');
    }

    // Hash password
    const passwordHash = await this.hashPassword(data.password);

    // Generate IDs
    const organizationId = `org_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      // Create organization first
      const { data: organizationData, error: orgError } = await supabase
        .from('organizations')
        .insert({
          id: organizationId,
          name: data.organizationName,
          domain: data.organizationDomain,
          subscription_status: 'trial',
          subscription_tier: 'personal_pro',
          trial_ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 day trial
          owner_id: userId
        })
        .select()
        .single();

      if (orgError) throw orgError;

      // Create user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .insert({
          id: userId,
          email: data.email,
          password_hash: passwordHash,
          first_name: data.firstName,
          last_name: data.lastName,
          organization_id: organizationId,
          role: 'owner',
          is_email_verified: false
        })
        .select()
        .single();

      if (userError) throw userError;

      // Generate auth token
      const token = this.generateToken(userId, organizationId);

      // Transform database format to API format
      const user: User = {
        id: userData.id,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        organizationId: userData.organization_id,
        role: userData.role,
        isEmailVerified: userData.is_email_verified,
        createdAt: userData.created_at,
        lastLoginAt: userData.last_login_at
      };

      const organization: Organization = {
        id: organizationData.id,
        name: organizationData.name,
        domain: organizationData.domain,
        subscriptionStatus: organizationData.subscription_status,
        subscriptionTier: organizationData.subscription_tier,
        trialEndsAt: organizationData.trial_ends_at,
        createdAt: organizationData.created_at,
        ownerId: organizationData.owner_id
      };

      return { user, organization, token };

    } catch (error) {
      console.error('Registration error:', error);
      throw new Error('Registration failed. Please try again.');
    }
  }

  // Login existing user
  async login(credentials: LoginCredentials): Promise<{ user: User; organization: Organization; token: string }> {
    if (!supabase) {
      throw new Error('Database not configured');
    }

    try {
      // Find user by email
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select(`
          *,
          organizations(*)
        `)
        .eq('email', credentials.email)
        .single();

      if (userError || !userData) {
        throw new Error('Invalid email or password');
      }

      // Verify password
      const isValidPassword = await this.verifyPassword(credentials.password, userData.password_hash);
      if (!isValidPassword) {
        throw new Error('Invalid email or password');
      }

      // Update last login
      await supabase
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', userData.id);

      // Generate new token
      const token = this.generateToken(userData.id, userData.organization_id);

      // Transform to API format
      const user: User = {
        id: userData.id,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        organizationId: userData.organization_id,
        role: userData.role,
        isEmailVerified: userData.is_email_verified,
        createdAt: userData.created_at,
        lastLoginAt: new Date().toISOString()
      };

      const organization: Organization = {
        id: userData.organizations.id,
        name: userData.organizations.name,
        domain: userData.organizations.domain,
        subscriptionStatus: userData.organizations.subscription_status,
        subscriptionTier: userData.organizations.subscription_tier,
        trialEndsAt: userData.organizations.trial_ends_at,
        createdAt: userData.organizations.created_at,
        ownerId: userData.organizations.owner_id
      };

      return { user, organization, token };

    } catch (error) {
      console.error('Login error:', error);
      throw new Error('Login failed. Please check your credentials.');
    }
  }

  // Get current user session
  async getCurrentSession(): Promise<AuthSession | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;
    
    if (!token) return null;

    const tokenData = this.verifyToken(token);
    if (!tokenData) return null;

    if (!supabase) return null;

    try {
      // Get user and organization data
      const { data: userData, error } = await supabase
        .from('users')
        .select(`
          *,
          organizations(*)
        `)
        .eq('id', tokenData.userId)
        .single();

      if (error || !userData) return null;

      const user: User = {
        id: userData.id,
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        organizationId: userData.organization_id,
        role: userData.role,
        isEmailVerified: userData.is_email_verified,
        createdAt: userData.created_at,
        lastLoginAt: userData.last_login_at
      };

      const organization: Organization = {
        id: userData.organizations.id,
        name: userData.organizations.name,
        domain: userData.organizations.domain,
        subscriptionStatus: userData.organizations.subscription_status,
        subscriptionTier: userData.organizations.subscription_tier,
        trialEndsAt: userData.organizations.trial_ends_at,
        createdAt: userData.organizations.created_at,
        ownerId: userData.organizations.owner_id
      };

      return {
        user,
        organization,
        token,
        expiresAt: tokenData.exp
      };

    } catch (error) {
      console.error('Session error:', error);
      return null;
    }
  }

  // Logout user
  async logout(): Promise<void> {
    const cookieStore = await cookies();
    cookieStore.delete('auth_token');
  }

  // Check if user has permission for action
  hasPermission(user: User, action: 'read' | 'write' | 'admin' | 'billing'): boolean {
    switch (action) {
      case 'read':
        return true; // All authenticated users can read
      case 'write':
        return ['owner', 'admin', 'member'].includes(user.role);
      case 'admin':
        return ['owner', 'admin'].includes(user.role);
      case 'billing':
        return user.role === 'owner';
      default:
        return false;
    }
  }

  // Password reset functionality
  async requestPasswordReset(email: string): Promise<void> {
    if (!supabase) {
      throw new Error('Database not configured');
    }

    // Check if user exists
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (!userData) {
      // Don't reveal if email exists for security
      return;
    }

    // Generate reset token
    const resetToken = Math.random().toString(36).substr(2, 32);
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Store reset token
    await supabase
      .from('users')
      .update({
        reset_token: resetToken,
        reset_token_expires: resetExpires.toISOString()
      })
      .eq('email', email);

    // TODO: Send email with reset link
    console.log(`Password reset requested for ${email}, token: ${resetToken}`);
  }

  // Reset password with token
  async resetPassword(token: string, newPassword: string): Promise<void> {
    if (!supabase) {
      throw new Error('Database not configured');
    }

    // Find user with valid reset token
    const { data: userData, error } = await supabase
      .from('users')
      .select('id, reset_token_expires')
      .eq('reset_token', token)
      .single();

    if (error || !userData) {
      throw new Error('Invalid or expired reset token');
    }

    // Check if token is expired
    if (new Date(userData.reset_token_expires) < new Date()) {
      throw new Error('Reset token has expired');
    }

    // Hash new password
    const passwordHash = await this.hashPassword(newPassword);

    // Update password and clear reset token
    await supabase
      .from('users')
      .update({
        password_hash: passwordHash,
        reset_token: null,
        reset_token_expires: null
      })
      .eq('reset_token', token);
  }
}

// Export singleton instance
export const authService = AuthService.getInstance();

// Utility functions for Next.js
export async function getServerSession(): Promise<AuthSession | null> {
  return authService.getCurrentSession();
}

export function requireAuth(session: AuthSession | null): AuthSession {
  if (!session) {
    throw new Error('Authentication required');
  }
  return session;
}

export function requirePermission(user: User, action: 'read' | 'write' | 'admin' | 'billing'): void {
  if (!authService.hasPermission(user, action)) {
    throw new Error(`Permission denied: ${action}`);
  }
} 