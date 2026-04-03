"use client";

import { useEffect, useRef } from "react";

import { updateEnrollmentProgress } from "@/features/enrollments/client";

type LessonProgressTrackerProps = {
  enrollmentId: string;
  lessonId: string;
  progressPercent: number;
  status: "ACTIVE" | "COMPLETED";
};

export function LessonProgressTracker({
  enrollmentId,
  lessonId,
  progressPercent,
  status,
}: LessonProgressTrackerProps) {
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    if (hasTrackedRef.current) {
      return;
    }

    hasTrackedRef.current = true;

    void updateEnrollmentProgress(enrollmentId, {
      progressPercent,
      lastLessonId: lessonId,
      status,
    }).catch(() => {
      hasTrackedRef.current = false;
    });
  }, [enrollmentId, lessonId, progressPercent, status]);

  return null;
}
