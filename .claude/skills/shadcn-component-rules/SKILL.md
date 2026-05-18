---
name: shadcn-component-rules
description: >
  Use this skill for creating new components
---

## Component Rules

- Always check if a specific component is available in shadcn before creating a custom component
- Always use shadcn components instead of creating custom components
- Always use shadcn tooltips
- This project uses @base-ui/react v1, not Radix UI. never use asChild as it doesn't exist.
- Always create separate components for the AlertDialog instead of using inline
- Always use % for size instead of integers

```tsx
<ResizablePanelGroup orientation="horizontal">
  <ResizablePanel defaultSize="20%" minSize="10%" maxSize="90%">
    <LeftPanel />
  </ResizablePanel>
  <ResizableHandle withHandle />
  <ResizablePanel defaultSize="80%" minSize="80%">
    <RightPanel />
  </ResizablePanel>
</ResizablePanelGroup>
```