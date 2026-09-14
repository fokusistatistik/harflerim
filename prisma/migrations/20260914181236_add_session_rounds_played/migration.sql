-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "totalDuration" INTEGER NOT NULL DEFAULT 0,
    "levelReached" INTEGER NOT NULL DEFAULT 1,
    "gameId" TEXT NOT NULL DEFAULT 'letter-hunt',
    "roundsPlayed" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Session" ("completedAt", "date", "gameId", "id", "levelReached", "startedAt", "totalDuration", "userId") SELECT "completedAt", "date", "gameId", "id", "levelReached", "startedAt", "totalDuration", "userId" FROM "Session";
DROP TABLE "Session";
ALTER TABLE "new_Session" RENAME TO "Session";
CREATE UNIQUE INDEX "Session_userId_date_gameId_key" ON "Session"("userId", "date", "gameId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
