"use client";

import { useAsyncOperation, useFormSubmission } from "./loading-hooks";
import { useLoadingManager } from "./loading-manager";
import { LoadingButton } from "../../components/ui/loading-button";

export function AsyncOperationExample() {
  const { execute, error } = useAsyncOperation();

  const handleAsyncOperation = async () => {
    const result = await execute(
      () => new Promise(resolve => setTimeout(() => resolve("Success!"), 2000)),
      "Processing your request..."
    );

    if (result) {
      console.log("Operation completed:", result);
    }
  };

  return (
    <div className="space-y-4">
      <LoadingButton onClick={handleAsyncOperation}>
        Start Async Operation
      </LoadingButton>
      {error && <p className="text-red-500">Error: {error.message}</p>}
    </div>
  );
}

export function FormSubmissionExample() {
  const { submit, isSubmitting, error } = useFormSubmission();

  const handleSubmit = async (formData: FormData) => {
    return submit(
      async () => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        return { success: true };
      },
      "Submitting form..."
    );
  };

  return (
    <form action={handleSubmit} className="space-y-4">
      <LoadingButton
        type="submit"
        isLoading={isSubmitting}
        loadingText="Submitting..."
      >
        Submit Form
      </LoadingButton>
      {error && <p className="text-red-500">Error: {error}</p>}
    </form>
  );
}

export function ManualLoadingExample() {
  const { showLoading, hideLoading } = useLoadingManager();

  const handleManualLoading = async () => {
    showLoading("Manual loading example...");
    await new Promise(resolve => setTimeout(resolve, 2000));
    hideLoading();
  };

  return (
    <LoadingButton onClick={handleManualLoading}>
      Manual Loading
    </LoadingButton>
  );
}
