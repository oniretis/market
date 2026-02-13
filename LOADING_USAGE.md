# Loading System Usage Guide

This project now includes a comprehensive loading state management system with automatic navigation loading. Here's how to use it:

## Components

### 1. LoadingSpinner
A basic spinner component with different sizes.

```tsx
import { LoadingSpinner } from "@/components/ui/loading-spinner";

<LoadingSpinner size="sm" />
<LoadingSpinner size="md" />
<LoadingSpinner size="lg" />
```

### 2. LoadingButton
A button with built-in loading states.

```tsx
import { LoadingButton } from "@/components/ui/loading-button";

<LoadingButton 
  isLoading={loading} 
  loadingText="Processing..."
  onClick={handleClick}
>
  Submit
</LoadingButton>
```

### 3. LoadingLink
A link component with automatic loading states for navigation.

```tsx
import { LoadingLink } from "@/components/ui/loading-link";

<LoadingLink href="/sell" loadingMessage="Opening sell page...">
  Sell Product
</LoadingLink>

<LoadingLink href="/home" showSpinner={false}>
  Home (no spinner)
</LoadingLink>
```

### 4. GlobalLoadingOverlay
Global overlay that appears when loading is active (automatically integrated).

```tsx
// Already integrated in layout.tsx
// Shows automatically when:
// - Navigation occurs (route changes)
// - Manual loading is triggered via useLoadingManager()
// - LoadingLink is clicked
```

### 5. Skeleton Components
Pre-built skeleton loaders for common UI patterns.

```tsx
import { ProductCardSkeleton, NavbarSkeleton, FormSkeleton } from "@/components/ui/skeleton";

<ProductCardSkeleton />
<NavbarSkeleton />
<FormSkeleton />
```

## Hooks

### useAsyncOperation
For handling async operations with automatic loading states.

```tsx
import { useAsyncOperation } from "@/app/lib/loading-hooks";

const { execute, error } = useAsyncOperation();

const handleOperation = async () => {
  const result = await execute(
    () => apiCall(),
    "Loading data..."
  );
  
  if (result) {
    // Handle success
  }
};
```

### useFormSubmission
For form submissions with loading states.

```tsx
import { useFormSubmission } from "@/app/lib/loading-hooks";

const { submit, isSubmitting, error } = useFormSubmission();

const handleSubmit = async (formData: FormData) => {
  const success = await submit(
    () => submitForm(formData),
    "Submitting form..."
  );
};
```

### useLoadingManager
Direct access to the global loading state.

```tsx
import { useLoadingManager } from "@/app/lib/loading-manager";

const { isLoading, loadingMessage, showLoading, hideLoading } = useLoadingManager();

// Manual loading control
showLoading("Custom message...");
hideLoading();
```

### useNavigationLoading
For programmatic navigation with loading states.

```tsx
import { useNavigationLoading } from "@/app/lib/use-navigation-loading";

const { 
  navigateWithLoading, 
  replaceWithLoading, 
  backWithLoading, 
  refreshWithLoading 
} = useNavigationLoading();

// Navigate with loading
navigateWithLoading("/sell", "Opening sell page...");
replaceWithLoading("/home", "Going home...");
backWithLoading("Going back...");
refreshWithLoading("Refreshing...");
```

## Automatic Navigation Loading

The system automatically shows loading states during:

1. **Route Changes** - When navigating between different pages
2. **Search Parameter Changes** - When filters or search parameters change
3. **LoadingLink Clicks** - When using the LoadingLink component
4. **Programmatic Navigation** - When using useNavigationLoading hooks

### Navigation Loading Behavior

- **Page Navigation**: Shows "Loading page..." for 500ms minimum
- **Search/Filter Updates**: Shows "Updating..." for 200ms minimum
- **Custom Messages**: You can specify custom loading messages

## Server Actions

### withLoading
Wrapper for server actions with error handling.

```tsx
import { withLoading } from "@/app/lib/loading-actions";

export async function myAction() {
  return withLoading(
    async () => {
      // Your server logic here
      return { data: "success" };
    },
    "Processing..."
  );
}
```

## Integration

The loading system is already integrated into your app:

1. **LoadingManagerProvider** and **NavigationLoadingProvider** are added to `layout.tsx`
2. **GlobalLoadingOverlay** is globally available
3. All components can use the loading hooks
4. Navigation automatically triggers loading states

## Examples

Check `app/lib/loading-examples.tsx` for general loading examples and `app/lib/navigation-examples.tsx` for navigation-specific examples.

## Best Practices

1. Use `LoadingLink` instead of regular `Link` for automatic navigation loading
2. Use `useNavigationLoading` for programmatic navigation
3. Use `useAsyncOperation` for API calls and data fetching
4. Use `useFormSubmission` for form handling
5. Use `LoadingButton` instead of regular buttons for async actions
6. Use skeleton components for initial page loads
7. Keep loading messages short and descriptive

## Navigation Loading Features

✅ **Automatic Route Detection** - Detects when you navigate between pages
✅ **Search Parameter Handling** - Shows shorter loading for filter/search changes
✅ **Custom Loading Messages** - Different messages for different navigation types
✅ **Programmatic Navigation** - Hooks for controlled navigation with loading
✅ **Link Component** - Drop-in replacement for Next.js Link with loading
✅ **Minimum Display Time** - Prevents flickering with minimum display times
✅ **Back/Forward Support** - Loading states for browser navigation
