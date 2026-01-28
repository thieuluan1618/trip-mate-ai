# Firebase Management Scripts

This directory contains utility scripts for managing your Firebase data.

## ⚠️ Important

Always backup your data before performing any delete operations!

## Available Scripts

### 1. Backup Metadata Only (Fast)

**Command:**
```bash
npm run backup-data
```

**What it does:**
- Exports all trips and items from Firebase to a JSON file
- Saves to `backups/` directory with timestamp
- **Only backs up metadata** (names, URLs, descriptions) - NOT the actual image/video files

**Example output:**
```
backups/firebase-backup-2024-01-15T10-30-00.json
```

**When to use:**
- Quick backup before small changes
- When you only need to restore metadata
- Faster backup, smaller file size

---

### 2. Backup Everything Including Assets (Complete) ⭐

**Command:**
```bash
npm run backup-full
```

**What it does:**
- Exports all trips and items from Firebase to a JSON file
- **Downloads all actual image and video files** from Firebase Storage
- Saves to a timestamped directory in `backups/`
- Complete offline backup - you can restore even if Firebase is wiped

**Example output:**
```
backups/backup-2024-01-15T10-30-00/
├── backup-metadata.json
└── assets/
    ├── abc123_original.jpg
    ├── abc123_thumb.webp
    ├── def456_video.mp4
    └── ...
```

**When to use:**
- ⭐ **Recommended before deleting photos**
- Complete data protection
- Want to keep your photos/videos offline
- Moving to a different Firebase project

---

### 3. Delete Photo by Name

**Command:**
```bash
npm run delete-photo "Photo Name"
```

**Example:**
```bash
npm run delete-photo "Thử thách trên cát"
```

**What it does:**
- Searches all trips for photos with the given name
- Deletes the photo from Firebase Storage (including thumbnails)
- Deletes the Firestore document

**⚠️ Warning: This operation cannot be undone!**

## Recommended Workflows

### Quick Backup (Metadata Only)

1. **Backup:**
   ```bash
   npm run backup-data
   ```

2. **Verify backup exists:**
   ```bash
   ls -la backups/
   ```

3. **Delete:**
   ```bash
   npm run delete-photo "Photo Name"
   ```

### Complete Backup (With Assets) ⭐ Recommended

1. **Full backup:**
   ```bash
   npm run backup-full
   ```

2. **Verify backup directory:**
   ```bash
   ls -la backups/backup-*/
   ```

3. **Delete:**
   ```bash
   npm run delete-photo "Photo Name"
   ```

## Backup File Structures

### Metadata Only Backup
```json
{
  "backupDate": "2024-01-15T10:30:00.000Z",
  "version": "1.0",
  "trips": [...],
  "items": [
    {
      "id": "...",
      "name": "Thử thách trên cát",
      "imageUrl": "https://firebasestorage...",
      "thumbnailUrl": "https://firebasestorage...",
      ...
    }
  ]
}
```

### Complete Backup (With Assets)
```json
{
  "backupDate": "2024-01-15T10:30:00.000Z",
  "version": "2.0",
  "trips": [...],
  "items": [
    {
      "id": "...",
      "name": "Thử thách trên cát",
      "imageUrl": "https://firebasestorage...",
      "backedUpImageUrl": "assets/abc123_original.jpg",  // Local backup path
      "thumbnailUrl": "https://firebasestorage...",
      "backedUpThumbnailUrl": "assets/abc123_thumb.webp",  // Local backup path
      ...
    }
  ]
}
```

## Storage Space Considerations

- **Metadata only:** ~10-100 KB per 1000 items
- **With assets:** Depends on your photo/video sizes (could be GBs)

## Troubleshooting

**Script not found:**
- Make sure you're in the project root directory
- Run `npm install` if needed

**Firebase connection error:**
- Check that `.env.local` exists with valid Firebase credentials
- Verify your Firebase project is active

**Download timeout during backup-full:**
- Large files may take longer to download
- Check your internet connection
- Try again if timeout occurs

**Photo not found:**
- The search is case-sensitive
- Check the exact name in your app first
