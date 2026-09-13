-- CreateTable
CREATE TABLE "ComparisonItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "color" TEXT NOT NULL,
    "colorHex" TEXT,
    "approxWeightKg" REAL,
    "approxVolumeL" REAL,
    "approxSizeCm" REAL,
    "sizeCategory" TEXT,
    "imageUrl" TEXT NOT NULL,
    "readingText" TEXT NOT NULL,
    "tags" TEXT NOT NULL,
    "attributesJson" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateIndex
CREATE UNIQUE INDEX "ComparisonItem_slug_key" ON "ComparisonItem"("slug");

-- CreateIndex
CREATE INDEX "ComparisonItem_category_idx" ON "ComparisonItem"("category");
