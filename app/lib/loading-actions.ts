"use server";

import { revalidatePath } from "next/cache";

export async function withLoading<T>(
  operation: () => Promise<T>,
  loadingMessage: string = "Processing..."
): Promise<{ success: boolean; data?: T; error?: string }> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "An error occurred";
    return { success: false, error: errorMessage };
  }
}

export async function withRevalidation<T>(
  operation: () => Promise<T>,
  pathToRevalidate: string,
  loadingMessage: string = "Processing..."
) {
  const result = await withLoading(operation, loadingMessage);
  
  if (result.success) {
    revalidatePath(pathToRevalidate);
  }
  
  return result;
}
