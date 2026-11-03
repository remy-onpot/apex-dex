-- Rename the existing enum value so stored statuses remain valid.
ALTER TYPE "ReviewStatus" RENAME VALUE 'REVIEWED' TO 'GRADED';
