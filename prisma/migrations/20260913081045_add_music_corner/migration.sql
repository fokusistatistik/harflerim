-- CreateTable
CREATE TABLE "Song" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "youtubeId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "thumbnailUrl" TEXT NOT NULL,
    "dailyLoopLimit" INTEGER NOT NULL DEFAULT 3,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Song_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SongPlayCount" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "songId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "playCount" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "SongPlayCount_songId_fkey" FOREIGN KEY ("songId") REFERENCES "Song" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE INDEX "Song_userId_idx" ON "Song"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "SongPlayCount_songId_date_key" ON "SongPlayCount"("songId", "date");
