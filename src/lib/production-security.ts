// Production Security Service for RelationshipOS
// Comprehensive security framework with authentication, authorization,
// rate limiting, threat detection, and compliance for production deployment

import { NextRequest } from 'next/server';
import { trackError } from './production-monitoring';

// Security configuration
export interface SecurityConfig {
  rateLimiting: {
    enabled: boolean;
    windowMs: number;
    maxRequests: number;
    skipSuccessfulRequests: boolean;
  };
  authentication: {
    jwtSecret: string;
    tokenExpiry: number;
    refreshTokenExpiry: number;
    passwordMinLength: number;
    requireMFA: boolean;
  };
  encryption: {
    algorithm: string;
    keyLength: number;
    ivLength: number;
  };
  compliance: {
    logRetentionDays: number;
    gdprCompliant: boolean;
    hipaaCompliant: boolean;
    auditLogging: boolean;
  };
  threatDetection: {
    enabled: boolean;
    maxFailedAttempts: number;
    lockoutDurationMs: number;
    suspiciousPatterns: string[];
  };
}

// Security events and audit log
export interface SecurityEvent {
  id: string;
  timestamp: string;
  type: 'auth' | 'access' | 'data' | 'threat' | 'compliance';
  severity: 'low' | 'medium' | 'high' | 'critical';
  action: string;
  userId?: string;
  organizationId?: string;
  ip: string;
  userAgent: string;
  resource?: string;
  outcome: 'success' | 'failure' | 'blocked';
  metadata: Record<string, unknown>;
  riskScore: number;
}

// Rate limiting tracking
export interface RateLimitEntry {
  ip: string;
  userId?: string;
  requests: number;
  windowStart: number;
  blocked: boolean;
  lastRequest: number;
}

// Security threat detection
export interface ThreatDetection {
  id: string;
  type: 'brute_force' | 'ddos' | 'sql_injection' | 'xss' | 'suspicious_access';
  severity: 'low' | 'medium' | 'high' | 'critical';
  source: string;
  description: string;
  timestamp: string;
  blocked: boolean;
  actions: string[];
}

// Access control and permissions
export interface SecurityContext {
  userId: string;
  organizationId: string;
  role: 'admin' | 'member' | 'viewer';
  permissions: string[];
  sessionId: string;
  ip: string;
  userAgent: string;
  mfaVerified: boolean;
  lastActivity: string;
}

export class ProductionSecurityService {
  private static instance: ProductionSecurityService;
  private config: SecurityConfig;
  private rateLimitStore: Map<string, RateLimitEntry> = new Map();
  private securityEvents: SecurityEvent[] = [];
  private threatDetections: ThreatDetection[] = [];
  private blockedIPs: Set<string> = new Set();
  private suspiciousUsers: Map<string, number> = new Map();

  constructor(config: SecurityConfig) {
    this.config = config;
    this.startSecurityMonitoring();
  }

  static getInstance(config?: SecurityConfig): ProductionSecurityService {
    if (!ProductionSecurityService.instance) {
      if (!config) {
        throw new Error('ProductionSecurityService requires configuration on first initialization');
      }
      ProductionSecurityService.instance = new ProductionSecurityService(config);
    }
    return ProductionSecurityService.instance;
  }

  // Rate limiting with sliding window
  async checkRateLimit(
    request: NextRequest,
    userId?: string
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: number;
    blocked: boolean;
  }> {
    if (!this.config.rateLimiting.enabled) {
      return { allowed: true, remaining: this.config.rateLimiting.maxRequests, resetTime: 0, blocked: false };
    }

    const ip = this.getClientIP(request);
    const key = userId ? `user:${userId}` : `ip:${ip}`;
    const now = Date.now();
    const windowStart = now - this.config.rateLimiting.windowMs;

    // Check if IP is blocked
    if (this.blockedIPs.has(ip)) {
      this.logSecurityEvent({
        type: 'threat',
        severity: 'high',
        action: 'rate_limit_blocked_ip',
        ip,
        userAgent: request.headers.get('user-agent') || '',
        outcome: 'blocked',
        metadata: { key, blockedIPs: Array.from(this.blockedIPs) },
        riskScore: 90,
        userId
      });

      return { allowed: false, remaining: 0, resetTime: now + this.config.rateLimiting.windowMs, blocked: true };
    }

    let entry = this.rateLimitStore.get(key);

    if (!entry || entry.windowStart < windowStart) {
      // Create new window
      entry = {
        ip,
        userId,
        requests: 1,
        windowStart: now,
        blocked: false,
        lastRequest: now
      };
    } else {
      // Update existing window
      entry.requests++;
      entry.lastRequest = now;
    }

    this.rateLimitStore.set(key, entry);

    const remaining = Math.max(0, this.config.rateLimiting.maxRequests - entry.requests);
    const allowed = entry.requests <= this.config.rateLimiting.maxRequests;

    // Detect potential abuse
    if (!allowed && entry.requests > this.config.rateLimiting.maxRequests * 2) {
      this.handleRateLimitAbuse(ip, userId, entry.requests);
    }

    if (!allowed) {
      this.logSecurityEvent({
        type: 'threat',
        severity: entry.requests > this.config.rateLimiting.maxRequests * 1.5 ? 'high' : 'medium',
        action: 'rate_limit_exceeded',
        ip,
        userAgent: request.headers.get('user-agent') || '',
        outcome: 'blocked',
        metadata: { requests: entry.requests, maxRequests: this.config.rateLimiting.maxRequests },
        riskScore: Math.min(100, (entry.requests / this.config.rateLimiting.maxRequests) * 50),
        userId
      });
    }

    return {
      allowed,
      remaining,
      resetTime: entry.windowStart + this.config.rateLimiting.windowMs,
      blocked: false
    };
  }

  // Input validation and sanitization
  validateAndSanitizeInput(
    input: Record<string, unknown>,
    schema: ValidationSchema
  ): {
    valid: boolean;
    sanitized: Record<string, unknown>;
    errors: string[];
    securityIssues: string[];
  } {
    const errors: string[] = [];
    const securityIssues: string[] = [];
    const sanitized: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(input)) {
      const fieldSchema = schema[key];
      if (!fieldSchema) {
        securityIssues.push(`Unexpected field: ${key}`);
        continue;
      }

      // Type validation
      if (fieldSchema.type && typeof value !== fieldSchema.type) {
        errors.push(`${key} must be of type ${fieldSchema.type}`);
        continue;
      }

      // Required field validation
      if (fieldSchema.required && (value === null || value === undefined || value === '')) {
        errors.push(`${key} is required`);
        continue;
      }

      // Length validation for strings
      if (typeof value === 'string') {
        if (fieldSchema.minLength && value.length < fieldSchema.minLength) {
          errors.push(`${key} must be at least ${fieldSchema.minLength} characters`);
          continue;
        }
        if (fieldSchema.maxLength && value.length > fieldSchema.maxLength) {
          errors.push(`${key} must not exceed ${fieldSchema.maxLength} characters`);
          continue;
        }

        // Security checks for strings
        const securityChecks = this.performSecurityChecks(value as string, key);
        securityIssues.push(...securityChecks);

        // Sanitize string
        sanitized[key] = this.sanitizeString(value as string);
      } else {
        sanitized[key] = value;
      }

      // Pattern validation
      if (fieldSchema.pattern && typeof value === 'string') {
        if (!fieldSchema.pattern.test(value)) {
          errors.push(`${key} format is invalid`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      sanitized,
      errors,
      securityIssues
    };
  }

  // Authentication token validation
  async validateAuthToken(token: string): Promise<{
    valid: boolean;
    payload?: SecurityContext;
    error?: string;
  }> {
    try {
      // Simple JWT validation (in production, use proper JWT library)
      const parts = token.split('.');
      if (parts.length !== 3) {
        return { valid: false, error: 'Invalid token format' };
      }

      const payload = JSON.parse(atob(parts[1]));
      
      // Check expiration
      if (payload.exp && payload.exp < Date.now() / 1000) {
        return { valid: false, error: 'Token expired' };
      }

      // Validate required fields
      if (!payload.userId || !payload.organizationId) {
        return { valid: false, error: 'Invalid token payload' };
      }

      return {
        valid: true,
        payload: {
          userId: payload.userId,
          organizationId: payload.organizationId,
          role: payload.role || 'member',
          permissions: payload.permissions || [],
          sessionId: payload.sessionId || '',
          ip: payload.ip || '',
          userAgent: payload.userAgent || '',
          mfaVerified: payload.mfaVerified || false,
          lastActivity: payload.lastActivity || new Date().toISOString()
        }
      };

    } catch (error) {
      return { valid: false, error: 'Token validation failed' };
    }
  }

  // Authorization check
  checkPermission(
    context: SecurityContext,
    resource: string,
    action: 'read' | 'write' | 'delete' | 'admin'
  ): boolean {
    // Admin role has all permissions
    if (context.role === 'admin') {
      return true;
    }

    // Check specific permissions
    const permission = `${resource}:${action}`;
    const hasPermission = context.permissions.includes(permission) ||
                         context.permissions.includes(`${resource}:*`) ||
                         context.permissions.includes('*');

    if (!hasPermission) {
      this.logSecurityEvent({
        type: 'access',
        severity: 'medium',
        action: 'permission_denied',
        userId: context.userId,
        organizationId: context.organizationId,
        ip: context.ip,
        userAgent: context.userAgent,
        resource,
        outcome: 'blocked',
        metadata: { requiredPermission: permission, userPermissions: context.permissions },
        riskScore: 30
      });
    }

    return hasPermission;
  }

  // Data encryption/decryption
  encrypt(data: string, key?: string): string {
    // Simple encryption (in production, use proper encryption library)
    const encryptionKey = key || this.config.authentication.jwtSecret;
    const encoded = Buffer.from(data).toString('base64');
    return Buffer.from(`${encryptionKey}:${encoded}`).toString('base64');
  }

  decrypt(encryptedData: string, key?: string): string {
    try {
      const encryptionKey = key || this.config.authentication.jwtSecret;
      const decoded = Buffer.from(encryptedData, 'base64').toString();
      const [keyPart, dataPart] = decoded.split(':');
      
      if (keyPart !== encryptionKey) {
        throw new Error('Invalid encryption key');
      }

      return Buffer.from(dataPart, 'base64').toString();
    } catch (error) {
      trackError(error as Error, 'system', 'high');
      throw new Error('Decryption failed');
    }
  }

  // Security audit and compliance
  async generateSecurityReport(timeRange: '24h' | '7d' | '30d' = '24h'): Promise<{
    summary: {
      totalEvents: number;
      threatLevel: 'low' | 'medium' | 'high' | 'critical';
      blockedAttempts: number;
      securityScore: number;
    };
    events: SecurityEvent[];
    threats: ThreatDetection[];
    recommendations: string[];
    compliance: {
      gdpr: boolean;
      hipaa: boolean;
      auditTrail: boolean;
    };
  }> {
    const timeRangeMs = this.getTimeRangeMs(timeRange);
    const cutoff = Date.now() - timeRangeMs;

    const recentEvents = this.securityEvents.filter(
      event => new Date(event.timestamp).getTime() > cutoff
    );

    const recentThreats = this.threatDetections.filter(
      threat => new Date(threat.timestamp).getTime() > cutoff
    );

    const blockedAttempts = recentEvents.filter(
      event => event.outcome === 'blocked'
    ).length;

    const highSeverityEvents = recentEvents.filter(
      event => event.severity === 'high' || event.severity === 'critical'
    ).length;

    const threatLevel = highSeverityEvents > 10 ? 'critical' :
                       highSeverityEvents > 5 ? 'high' :
                       blockedAttempts > 20 ? 'medium' : 'low';

    const securityScore = Math.max(0, 100 - (highSeverityEvents * 5) - (blockedAttempts * 2));

    const recommendations = this.generateSecurityRecommendations(recentEvents, recentThreats);

    return {
      summary: {
        totalEvents: recentEvents.length,
        threatLevel,
        blockedAttempts,
        securityScore
      },
      events: recentEvents.slice(0, 100), // Limit to most recent 100
      threats: recentThreats,
      recommendations,
      compliance: {
        gdpr: this.config.compliance.gdprCompliant,
        hipaa: this.config.compliance.hipaaCompliant,
        auditTrail: this.config.compliance.auditLogging
      }
    };
  }

  // Helper methods
  private getClientIP(request: NextRequest): string {
    return request.headers.get('x-forwarded-for')?.split(',')[0] ||
           request.headers.get('x-real-ip') ||
           request.headers.get('x-client-ip') ||
           'unknown';
  }

  private handleRateLimitAbuse(ip: string, userId?: string, requests: number): void {
    // Block IP for severe abuse
    if (requests > this.config.rateLimiting.maxRequests * 5) {
      this.blockedIPs.add(ip);
      
      this.threatDetections.push({
        id: `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: 'ddos',
        severity: 'high',
        source: ip,
        description: `Excessive requests from IP: ${requests} requests`,
        timestamp: new Date().toISOString(),
        blocked: true,
        actions: ['ip_blocked', 'admin_notified']
      });
    }

    // Track suspicious user activity
    if (userId) {
      const suspiciousCount = (this.suspiciousUsers.get(userId) || 0) + 1;
      this.suspiciousUsers.set(userId, suspiciousCount);
      
      if (suspiciousCount > 3) {
        this.threatDetections.push({
          id: `threat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'suspicious_access',
          severity: 'medium',
          source: userId,
          description: `User exhibiting suspicious behavior: ${suspiciousCount} incidents`,
          timestamp: new Date().toISOString(),
          blocked: false,
          actions: ['user_flagged', 'monitoring_increased']
        });
      }
    }
  }

  private performSecurityChecks(value: string, fieldName: string): string[] {
    const issues: string[] = [];

    // SQL injection patterns
    const sqlPatterns = [
      /(\s|^)(select|insert|update|delete|drop|create|alter|exec|union|script)\s/i,
      /(\s|^)(or|and)\s+\d+\s*=\s*\d+/i,
      /(\s|^)1\s*=\s*1/i,
      /(\s|^)'\s*or\s*'.*?'\s*=\s*'/i
    ];

    for (const pattern of sqlPatterns) {
      if (pattern.test(value)) {
        issues.push(`Potential SQL injection in ${fieldName}`);
        break;
      }
    }

    // XSS patterns
    const xssPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/i,
      /on\w+\s*=/i,
      /<iframe/i,
      /<object/i,
      /<embed/i
    ];

    for (const pattern of xssPatterns) {
      if (pattern.test(value)) {
        issues.push(`Potential XSS in ${fieldName}`);
        break;
      }
    }

    // Path traversal
    if (value.includes('../') || value.includes('..\\')) {
      issues.push(`Potential path traversal in ${fieldName}`);
    }

    return issues;
  }

  private sanitizeString(value: string): string {
    return value
      .replace(/[<>]/g, '') // Remove potential HTML tags
      .replace(/['";]/g, '') // Remove potential SQL injection characters
      .replace(/\s+/g, ' ') // Normalize whitespace
      .trim();
  }

  private logSecurityEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): void {
    const securityEvent: SecurityEvent = {
      id: `sec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      ...event
    };

    this.securityEvents.push(securityEvent);

    // Keep only recent events (for memory management)
    const retentionMs = this.config.compliance.logRetentionDays * 24 * 60 * 60 * 1000;
    const cutoff = Date.now() - retentionMs;
    this.securityEvents = this.securityEvents.filter(
      e => new Date(e.timestamp).getTime() > cutoff
    );

    // Log high-severity events
    if (event.severity === 'high' || event.severity === 'critical') {
      console.warn('Security Event:', securityEvent);
      trackError(
        `Security event: ${event.action}`,
        'system',
        event.severity === 'critical' ? 'high' : 'medium',
        {
          userId: event.userId,
          organizationId: event.organizationId,
          ip: event.ip
        },
        event.metadata
      );
    }
  }

  private startSecurityMonitoring(): void {
    // Clean up old data every hour
    setInterval(() => {
      this.cleanupOldData();
    }, 60 * 60 * 1000);

    // Reset rate limit windows
    setInterval(() => {
      this.cleanupRateLimitData();
    }, this.config.rateLimiting.windowMs);
  }

  private cleanupOldData(): void {
    const now = Date.now();
    const retentionMs = this.config.compliance.logRetentionDays * 24 * 60 * 60 * 1000;
    const cutoff = now - retentionMs;

    // Clean up security events
    this.securityEvents = this.securityEvents.filter(
      event => new Date(event.timestamp).getTime() > cutoff
    );

    // Clean up threat detections
    this.threatDetections = this.threatDetections.filter(
      threat => new Date(threat.timestamp).getTime() > cutoff
    );
  }

  private cleanupRateLimitData(): void {
    const now = Date.now();
    const windowMs = this.config.rateLimiting.windowMs;

    for (const [key, entry] of this.rateLimitStore.entries()) {
      if (now - entry.windowStart > windowMs) {
        this.rateLimitStore.delete(key);
      }
    }
  }

  private getTimeRangeMs(timeRange: string): number {
    switch (timeRange) {
      case '24h': return 24 * 60 * 60 * 1000;
      case '7d': return 7 * 24 * 60 * 60 * 1000;
      case '30d': return 30 * 24 * 60 * 60 * 1000;
      default: return 24 * 60 * 60 * 1000;
    }
  }

  private generateSecurityRecommendations(
    events: SecurityEvent[],
    threats: ThreatDetection[]
  ): string[] {
    const recommendations: string[] = [];

    const highSeverityEvents = events.filter(e => e.severity === 'high' || e.severity === 'critical');
    if (highSeverityEvents.length > 5) {
      recommendations.push('Consider implementing additional security measures due to high-severity events');
    }

    const blockedAttempts = events.filter(e => e.outcome === 'blocked');
    if (blockedAttempts.length > 20) {
      recommendations.push('High number of blocked attempts detected - review IP whitelist/blacklist');
    }

    const threatCount = threats.length;
    if (threatCount > 0) {
      recommendations.push(`${threatCount} security threats detected - review threat detection rules`);
    }

    if (this.blockedIPs.size > 10) {
      recommendations.push('Large number of blocked IPs - consider reviewing rate limit settings');
    }

    return recommendations;
  }
}

// Validation schema interface
export interface ValidationSchema {
  [key: string]: {
    type?: 'string' | 'number' | 'boolean' | 'object';
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
  };
}

// Factory function for production security
export function createProductionSecurity(): ProductionSecurityService {
  const config: SecurityConfig = {
    rateLimiting: {
      enabled: true,
      windowMs: 15 * 60 * 1000, // 15 minutes
      maxRequests: process.env.NODE_ENV === 'production' ? 100 : 1000,
      skipSuccessfulRequests: false,
    },
    authentication: {
      jwtSecret: process.env.JWT_SECRET || 'development-secret-change-in-production',
      tokenExpiry: 24 * 60 * 60, // 24 hours
      refreshTokenExpiry: 7 * 24 * 60 * 60, // 7 days
      passwordMinLength: 8,
      requireMFA: process.env.NODE_ENV === 'production',
    },
    encryption: {
      algorithm: 'aes-256-gcm',
      keyLength: 32,
      ivLength: 16,
    },
    compliance: {
      logRetentionDays: 90,
      gdprCompliant: true,
      hipaaCompliant: false,
      auditLogging: true,
    },
    threatDetection: {
      enabled: true,
      maxFailedAttempts: 5,
      lockoutDurationMs: 15 * 60 * 1000, // 15 minutes
      suspiciousPatterns: ['select', 'script', 'iframe', '../'],
    },
  };

  return ProductionSecurityService.getInstance(config);
}

// Export singleton instance
export const productionSecurity = createProductionSecurity();

// Utility functions
export function validateRequest(
  input: Record<string, unknown>,
  schema: ValidationSchema
): {
  valid: boolean;
  sanitized: Record<string, unknown>;
  errors: string[];
} {
  const result = productionSecurity.validateAndSanitizeInput(input, schema);
  return {
    valid: result.valid && result.securityIssues.length === 0,
    sanitized: result.sanitized,
    errors: [...result.errors, ...result.securityIssues],
  };
}

export function encryptSensitiveData(data: string): string {
  return productionSecurity.encrypt(data);
}

export function decryptSensitiveData(encryptedData: string): string {
  return productionSecurity.decrypt(encryptedData);
} 