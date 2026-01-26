-- CreateTable
CREATE TABLE "Downtime" (
    "id" TEXT NOT NULL,
    "machineId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "startTime" TIMESTAMP(3) NOT NULL,
    "endTime" TIMESTAMP(3),
    "duration" INTEGER,
    "notes" TEXT,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Downtime_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Downtime_machineId_startTime_idx" ON "Downtime"("machineId", "startTime");

-- AddForeignKey
ALTER TABLE "Downtime" ADD CONSTRAINT "Downtime_machineId_fkey" FOREIGN KEY ("machineId") REFERENCES "Machine"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Downtime" ADD CONSTRAINT "Downtime_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
