-- CreateTable
CREATE TABLE "ContentSet" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "letter" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "imageUrl" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "ContentItem" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "contentSetId" TEXT NOT NULL,
    "word" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    CONSTRAINT "ContentItem_contentSetId_fkey" FOREIGN KEY ("contentSetId") REFERENCES "ContentSet" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "ContentSet_letter_key" ON "ContentSet"("letter");

-- CreateIndex
CREATE INDEX "ContentSet_order_idx" ON "ContentSet"("order");

-- CreateIndex
CREATE INDEX "ContentItem_contentSetId_idx" ON "ContentItem"("contentSetId");

