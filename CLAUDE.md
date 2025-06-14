# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
# Start development server with Turbopack
bun dev

# Build for production
bun build

# Run production server
bun start

# Run linting
bun lint
```

Note: This project uses Bun as the package manager. No test commands are currently configured.

## Architecture Overview

This is a Next.js 15 book management application using the App Router. The architecture follows a clean separation of concerns:

### State Management

- **Jotai** atoms in `atoms/bookAtoms.ts` manage global state
- Books are stored with hierarchical relationships (parent-child via `nextBooks`)
- Derived atoms handle filtering and tree structure computation

### Core Data Model

Books have priorities ("高" or "未指定") and can reference other books as children through `nextBooks` array. The `Book` interface in `lib/types.ts` defines the core data structure.

### Component Architecture

- **Container Components**: `book-manager.tsx` handles state and business logic
- **Presentational Components**: `book-item.tsx` renders individual books
- **Custom Hooks**: `useBookManager.ts` encapsulates all book management logic
- **UI Components**: shadcn/ui components in `components/ui/` (Button, Dialog, Input, etc.)

### Key Patterns

- TypeScript strict mode for type safety
- Path alias `@/` maps to project root
- CSS variables for theming with Tailwind CSS 4
- Radix UI primitives wrapped with shadcn/ui styling

## Coding Conventions

### React

- Props の型定義は `Props` という名前を使用する

### TypeScript

- 型定義には `interface` ではなく `type` を使用する
