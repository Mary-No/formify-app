-- CreateIndex
CREATE INDEX "Template_createdAt_idx" ON "Template"("createdAt");

-- CreateIndex
CREATE INDEX "Template_isPublic_idx" ON "Template"("isPublic");

-- CreateIndex
CREATE INDEX "Template_authorId_idx" ON "Template"("authorId");

-- CreateIndex
CREATE INDEX "Template_title_idx" ON "Template"("title");

-- CreateIndex
CREATE INDEX "Template_topic_idx" ON "Template"("topic");
