-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Chapter" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "storyId" TEXT NOT NULL,
    "index" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "isVip" BOOLEAN NOT NULL DEFAULT false,
    "coinPrice" INTEGER NOT NULL DEFAULT 0,
    "wordCount" INTEGER NOT NULL DEFAULT 0,
    "pageStart" INTEGER,
    "pageEnd" INTEGER,
    "publishedAt" DATETIME,
    "autoSavedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Chapter_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Chapter" ("autoSavedAt", "coinPrice", "content", "createdAt", "id", "index", "isVip", "publishedAt", "status", "storyId", "title", "updatedAt") SELECT "autoSavedAt", "coinPrice", "content", "createdAt", "id", "index", "isVip", "publishedAt", "status", "storyId", "title", "updatedAt" FROM "Chapter";
DROP TABLE "Chapter";
ALTER TABLE "new_Chapter" RENAME TO "Chapter";
CREATE UNIQUE INDEX "Chapter_storyId_index_key" ON "Chapter"("storyId", "index");
CREATE TABLE "new_Story" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "coverUri" TEXT NOT NULL DEFAULT '',
    "genres" TEXT NOT NULL DEFAULT '[]',
    "status" TEXT NOT NULL DEFAULT 'ongoing',
    "moderation" TEXT NOT NULL DEFAULT 'PENDING',
    "visibility" TEXT NOT NULL DEFAULT 'PUBLIC',
    "source" TEXT NOT NULL DEFAULT 'ORIGINAL',
    "sourceFileUri" TEXT,
    "pageCount" INTEGER,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "ratingSum" INTEGER NOT NULL DEFAULT 0,
    "ratingCount" INTEGER NOT NULL DEFAULT 0,
    "ratingAvg" REAL NOT NULL DEFAULT 0,
    "authorId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Story_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Story" ("authorId", "coverUri", "createdAt", "description", "genres", "id", "moderation", "ratingAvg", "ratingCount", "ratingSum", "status", "title", "updatedAt", "viewCount") SELECT "authorId", "coverUri", "createdAt", "description", "genres", "id", "moderation", "ratingAvg", "ratingCount", "ratingSum", "status", "title", "updatedAt", "viewCount" FROM "Story";
DROP TABLE "Story";
ALTER TABLE "new_Story" RENAME TO "Story";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
