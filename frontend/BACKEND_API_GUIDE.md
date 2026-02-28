# Backend Implementation Guide - Code Editor API

This guide explains how to implement the backend API endpoints required for the embedded code editor functionality in CloudForge.

## API Endpoints

### 1. List Project Files
**Endpoint:** `GET /api/projects/{projectId}/files`

**Description:** List all files and folders in a project.

**Response:**
```json
{
  "files": [
    {
      "path": "main.tf",
      "name": "main.tf",
      "type": "file",
      "language": "hcl",
      "size": 1024,
      "createdAt": "2024-02-27T10:00:00Z",
      "updatedAt": "2024-02-27T10:00:00Z"
    },
    {
      "path": "variables.tf",
      "name": "variables.tf",
      "type": "file",
      "language": "hcl",
      "size": 512,
      "createdAt": "2024-02-27T10:00:00Z",
      "updatedAt": "2024-02-27T10:00:00Z"
    },
    {
      "path": "terraform",
      "name": "terraform",
      "type": "folder",
      "createdAt": "2024-02-27T10:00:00Z",
      "updatedAt": "2024-02-27T10:00:00Z",
      "children": []
    }
  ],
  "total": 3
}
```

**Status Codes:**
- `200 OK` - Files retrieved successfully
- `404 Not Found` - Project not found
- `401 Unauthorized` - Not authenticated

---

### 2. Get File Content
**Endpoint:** `GET /api/projects/{projectId}/files/content?path={filePath}`

**Description:** Retrieve the content of a specific file.

**Query Parameters:**
- `path` (required): File path relative to project root

**Response:**
```json
{
  "path": "main.tf",
  "content": "terraform {\n  required_version = \">= 1.0\"\n  ...\n}",
  "language": "hcl",
  "size": 1024,
  "encoding": "utf-8",
  "createdAt": "2024-02-27T10:00:00Z",
  "updatedAt": "2024-02-27T10:00:00Z"
}
```

**Status Codes:**
- `200 OK` - File retrieved successfully
- `400 Bad Request` - Invalid path
- `404 Not Found` - File or project not found
- `401 Unauthorized` - Not authenticated

---

### 3. Save File
**Endpoint:** `POST /api/projects/{projectId}/files/save`

**Description:** Save or update file content.

**Request Body:**
```json
{
  "path": "main.tf",
  "content": "resource \"aws_instance\" \"example\" {\n  ...\n}",
  "message": "Add EC2 instance configuration"
}
```

**Response:**
```json
{
  "path": "main.tf",
  "saved": true,
  "message": "File saved successfully",
  "size": 1024,
  "updatedAt": "2024-02-27T10:05:00Z"
}
```

**Validation:**
- File content must not exceed 10 MB
- Path must not contain `..` or start with `/`
- Only specific file extensions allowed: `.tf`, `.tfvars`, `.json`, `.md`, `.txt`

**Status Codes:**
- `200 OK` - File saved successfully
- `400 Bad Request` - Invalid payload or validation failed
- `404 Not Found` - Project not found
- `413 Payload Too Large` - File too large
- `401 Unauthorized` - Not authenticated

---

### 4. Download File
**Endpoint:** `GET /api/projects/{projectId}/files/download?path={filePath}`

**Description:** Download a file as binary.

**Query Parameters:**
- `path` (required): File path relative to project root

**Response:**
- Content-Type: `application/octet-stream` or `text/plain`
- Content-Disposition: `attachment; filename="main.tf"`
- Body: File content as bytes

**Status Codes:**
- `200 OK` - File downloaded successfully
- `400 Bad Request` - Invalid path
- `404 Not Found` - File or project not found
- `401 Unauthorized` - Not authenticated

---

### 5. Delete File (Optional)
**Endpoint:** `DELETE /api/projects/{projectId}/files/{filePath}`

**Description:** Delete a file.

**Path Parameters:**
- `filePath`: File path (URL encoded)

**Response:**
```json
{
  "deleted": true,
  "path": "temp.tf",
  "message": "File deleted successfully"
}
```

**Status Codes:**
- `200 OK` - File deleted successfully
- `404 Not Found` - File or project not found
- `401 Unauthorized` - Not authenticated

---

### 6. Update File (Optional)
**Endpoint:** `PUT /api/projects/{projectId}/files/{filePath}`

**Description:** Update file metadata or content.

**Request Body:**
```json
{
  "content": "...",
  "name": "main.tf",
  "tags": ["terraform", "production"]
}
```

**Response:** Same as Save File endpoint

**Status Codes:**
- `200 OK` - File updated successfully
- `400 Bad Request` - Invalid payload
- `404 Not Found` - File or project not found
- `401 Unauthorized` - Not authenticated

---

## Authentication & Authorization

All endpoints require:

1. **JWT Token:** Include in `Authorization: Bearer <token>` header
2. **Project Ownership:** User must have access to the project
3. **File Permissions:** User must have read/write permissions based on action

Example header:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Example Implementation (Node.js/Express)

```typescript
import express, { Router, Request, Response } from 'express'
import * as fs from 'fs/promises'
import * as path from 'path'

const router = Router()
const PROJECT_ROOT = process.env.PROJECTS_DIR || '/var/projects'

// Middleware to verify project access
async function verifyProjectAccess(req: Request, res: Response, next) {
  const { projectId } = req.params
  const userId = req.user.id

  // Check if user owns/has access to project
  const project = await db.projects.findOne({ id: projectId, userId })
  if (!project) {
    return res.status(404).json({ error: 'Project not found' })
  }

  req.project = project
  next()
}

// List files
router.get('/projects/:projectId/files', verifyProjectAccess, async (req, res) => {
  try {
    const projectPath = path.join(PROJECT_ROOT, req.project.id)
    const files = await listFilesRecursive(projectPath)
    
    res.json({
      files,
      total: files.length
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to list files' })
  }
})

// Get file content
router.get('/projects/:projectId/files/content', verifyProjectAccess, async (req, res) => {
  try {
    const { path: filePath } = req.query
    
    // Security: Prevent directory traversal
    if (typeof filePath !== 'string' || filePath.includes('..')) {
      return res.status(400).json({ error: 'Invalid file path' })
    }

    const fullPath = path.join(PROJECT_ROOT, req.project.id, filePath)
    const content = await fs.readFile(fullPath, 'utf-8')
    const stat = await fs.stat(fullPath)

    res.json({
      path: filePath,
      content,
      language: detectLanguage(filePath),
      size: stat.size,
      encoding: 'utf-8',
      createdAt: stat.birthtime.toISOString(),
      updatedAt: stat.mtime.toISOString()
    })
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'File not found' })
    }
    res.status(500).json({ error: 'Failed to read file' })
  }
})

// Save file
router.post('/projects/:projectId/files/save', verifyProjectAccess, async (req, res) => {
  try {
    const { path: filePath, content, message } = req.body

    // Validation
    if (!filePath || typeof filePath !== 'string') {
      return res.status(400).json({ error: 'Invalid path' })
    }
    
    if (filePath.includes('..') || filePath.startsWith('/')) {
      return res.status(400).json({ error: 'Invalid file path' })
    }

    if (typeof content !== 'string' || content.length > 10 * 1024 * 1024) {
      return res.status(413).json({ error: 'File too large' })
    }

    // Check extension
    const ext = path.extname(filePath)
    const allowedExts = ['.tf', '.tfvars', '.json', '.md', '.txt']
    if (!allowedExts.includes(ext)) {
      return res.status(400).json({ error: 'File type not allowed' })
    }

    const fullPath = path.join(PROJECT_ROOT, req.project.id, filePath)
    const dir = path.dirname(fullPath)

    // Create directory if not exists
    await fs.mkdir(dir, { recursive: true })

    // Write file
    await fs.writeFile(fullPath, content, 'utf-8')

    // Log change (for versioning)
    if (message) {
      await logFileChange(req.project.id, filePath, message, req.user.id)
    }

    res.json({
      path: filePath,
      saved: true,
      message: 'File saved successfully',
      size: content.length,
      updatedAt: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({ error: 'Failed to save file' })
  }
})

// Download file
router.get('/projects/:projectId/files/download', verifyProjectAccess, async (req, res) => {
  try {
    const { path: filePath } = req.query
    
    if (typeof filePath !== 'string' || filePath.includes('..')) {
      return res.status(400).json({ error: 'Invalid file path' })
    }

    const fullPath = path.join(PROJECT_ROOT, req.project.id, filePath)
    const content = await fs.readFile(fullPath)

    res.setHeader('Content-Disposition', `attachment; filename="${path.basename(filePath)}"`)
    res.setHeader('Content-Type', 'application/octet-stream')
    res.send(content)
  } catch (error) {
    if (error.code === 'ENOENT') {
      return res.status(404).json({ error: 'File not found' })
    }
    res.status(500).json({ error: 'Failed to download file' })
  }
})

// Helper functions
async function listFilesRecursive(dirPath: string, prefix = '') {
  const files = []
  const entries = await fs.readdir(dirPath, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name
    const stat = await fs.stat(fullPath)

    if (entry.isDirectory()) {
      files.push({
        name: entry.name,
        path: relativePath,
        type: 'folder',
        createdAt: stat.birthtime.toISOString(),
        updatedAt: stat.mtime.toISOString(),
        children: []
      })
      
      if (!entry.name.startsWith('.')) {
        const subFiles = await listFilesRecursive(fullPath, relativePath)
        files[files.length - 1].children = subFiles
      }
    } else {
      files.push({
        name: entry.name,
        path: relativePath,
        type: 'file',
        language: detectLanguage(entry.name),
        size: stat.size,
        createdAt: stat.birthtime.toISOString(),
        updatedAt: stat.mtime.toISOString()
      })
    }
  }

  return files
}

function detectLanguage(filePath: string): string {
  const ext = path.extname(filePath)
  const map = {
    '.tf': 'hcl',
    '.tfvars': 'hcl',
    '.json': 'json',
    '.yaml': 'yaml',
    '.yml': 'yaml',
    '.md': 'markdown',
    '.py': 'python',
    '.sh': 'bash'
  }
  return map[ext] || 'text'
}

async function logFileChange(projectId: string, filePath: string, message: string, userId: string) {
  // Implement versioning/audit logging
  // Could store in database or file system
}

export default router
```

---

## Storage Considerations

### File System Storage
- Store files in project directories: `/var/projects/{projectId}/`
- Use `.gitignore` patterns to exclude sensitive files
- Regularly backup project files
- Implement file size limits per project

### Database Storage
- Store file metadata in database (size, created date, updated date)
- Keep version history for audit trails
- Cache frequently accessed files

### Cloud Storage (S3, GCS, etc.)
```typescript
// Example: AWS S3
const s3 = new AWS.S3()

await s3.putObject({
  Bucket: 'cloudforge-projects',
  Key: `${projectId}/${filePath}`,
  Body: content,
  Metadata: {
    'user-id': userId,
    'project-id': projectId
  }
}).promise()
```

---

## Security Best Practices

1. **Path Validation:**
   - Always validate paths to prevent directory traversal
   - Whitelist allowed file extensions
   - Use `path.normalize()` and check against project root

2. **File Size Limits:**
   - Enforce maximum file size (10 MB recommended)
   - Implement per-project storage quota (100 MB recommended)

3. **Rate Limiting:**
   - Limit file operations per minute (100 requests/min recommended)
   - Prevent DoS attacks on large file downloads

4. **Access Control:**
   - Verify project ownership before any operation
   - Log all file modifications for audit trail
   - Support file-level permissions (future enhancement)

5. **Sensitive Data:**
   - Never expose `.tfstate` files containing sensitive data
   - Mask secrets in code editor
   - Support `.gitignore` patterns for excluded files

---

## Testing

```bash
# Test listing files
curl -H "Authorization: Bearer TOKEN" \
  https://api.example.com/api/projects/proj-1/files

# Test getting file content
curl -H "Authorization: Bearer TOKEN" \
  "https://api.example.com/api/projects/proj-1/files/content?path=main.tf"

# Test saving file
curl -X POST -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"path":"main.tf","content":"...","message":"Update"}' \
  https://api.example.com/api/projects/proj-1/files/save

# Test downloading file
curl -H "Authorization: Bearer TOKEN" \
  "https://api.example.com/api/projects/proj-1/files/download?path=main.tf" \
  --output main.tf
```

---

## Performance Optimization

1. **Caching:**
   - Cache file metadata for 5 minutes
   - Cache frequently accessed files (< 1 MB) in memory

2. **Compression:**
   - Gzip large responses (> 5 KB)
   - Support range requests for large files

3. **Async Operations:**
   - Use async/await for file operations
   - Queue large file operations to background jobs

4. **Pagination:**
   - For large projects with many files, implement pagination
   - Show first 100 files, load more on demand

---

## Error Handling

Implement consistent error responses:

```json
{
  "error": "File not found",
  "code": "FILE_NOT_FOUND",
  "details": {
    "path": "main.tf",
    "projectId": "proj-1"
  }
}
```

---

## Migration Guide

**For existing projects without file storage:**

1. Generate files from canvas graph using terraform.ts utility
2. Store generated files in project directory
3. Create file metadata in database
4. Implement lazy loading for large projects
5. Backup existing state

---

## Related Documentation

- [Code Editor Guide](./CODE_EDITOR_GUIDE.md)
- [API Types Documentation](./src/types/files.ts)
- [API Service Layer](./src/services/api.ts)
