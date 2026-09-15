-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_UserSettings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "parentPin" TEXT NOT NULL DEFAULT '0000',
    "dailyScreenLimit" INTEGER NOT NULL DEFAULT 1800,
    "dailyLetterHuntLimit" INTEGER NOT NULL DEFAULT 100,
    "dailyMemoryMatchLimit" INTEGER NOT NULL DEFAULT 20,
    "dailyVisualMatchLimit" INTEGER NOT NULL DEFAULT 20,
    "reduceMotion" BOOLEAN NOT NULL DEFAULT false,
    "highContrast" BOOLEAN NOT NULL DEFAULT false,
    "speechEnabled" BOOLEAN NOT NULL DEFAULT true,
    "cameraEnabled" BOOLEAN NOT NULL DEFAULT false,
    "age" INTEGER,
    "gender" TEXT,
    "favoriteColor" TEXT,
    "interests" TEXT,
    "learningChannel" TEXT,
    "sensoryProfile" TEXT,
    "triggers" TEXT,
    "calmers" TEXT,
    "communicationLevel" TEXT,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_UserSettings" ("age", "calmers", "cameraEnabled", "communicationLevel", "dailyLetterHuntLimit", "dailyMemoryMatchLimit", "dailyScreenLimit", "favoriteColor", "gender", "highContrast", "id", "interests", "learningChannel", "parentPin", "reduceMotion", "sensoryProfile", "speechEnabled", "triggers", "updatedAt", "userId") SELECT "age", "calmers", "cameraEnabled", "communicationLevel", "dailyLetterHuntLimit", "dailyMemoryMatchLimit", "dailyScreenLimit", "favoriteColor", "gender", "highContrast", "id", "interests", "learningChannel", "parentPin", "reduceMotion", "sensoryProfile", "speechEnabled", "triggers", "updatedAt", "userId" FROM "UserSettings";
DROP TABLE "UserSettings";
ALTER TABLE "new_UserSettings" RENAME TO "UserSettings";
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
