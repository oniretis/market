-- AlterTable
ALTER TABLE "Advertisement" ADD COLUMN     "videoUrl" TEXT;

-- CreateIndex
CREATE INDEX "ChatConversation_isActive_updatedAt_idx" ON "ChatConversation"("isActive", "updatedAt");

-- CreateIndex
CREATE INDEX "ChatConversation_adminId_isActive_idx" ON "ChatConversation"("adminId", "isActive");

-- CreateIndex
CREATE INDEX "Message_conversationId_createdAt_idx" ON "Message"("conversationId", "createdAt");

-- CreateIndex
CREATE INDEX "Message_conversationId_isRead_idx" ON "Message"("conversationId", "isRead");
