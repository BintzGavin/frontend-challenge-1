# Machine Readable Files (MRF) Application Design

## Overview

This application facilitates the creation of Machine Readable Files (MRF) from healthcare claims data. It provides a user interface for uploading claims data, reviewing and approving claims, and accessing generated MRF files.

## Architecture

### Frontend Architecture

The application follows a modern React architecture with TypeScript, utilizing several key libraries and patterns:

#### Core Technologies
- **React**: Frontend framework
- **TypeScript**: Type safety and developer experience
- **Vite**: Build tool and development server

#### Key Libraries
- **@mantine/core**: UI component library
- **AG Grid**: Data grid for claims display and management
- **MobX**: State management
- **React Router**: Navigation and routing
- **Zod**: Schema validation
- **Papa Parse**: CSV parsing

#### Directory Structure 
frontend/
├── src/
│ ├── components/ # Reusable UI components
│ ├── pages/ # Route-level components
│ │ ├── approval/ # Claims approval interface
│ │ ├── public-mrf/ # MRF files listing
│ │ └── upload/ # File upload interface
│ ├── services/ # API and utility services
│ ├── stores/ # MobX state management
│ └── utils/ # Helper functions and types

### Backend Architecture

A lightweight Node.js server handling file processing and storage:

#### Core Technologies
- **Node.js**: Runtime environment
- **Hono**: Web framework
- **TypeScript**: Type safety

#### API Endpoints
- `POST /upload`: Receive and validate claims data
- `GET /claims`: Retrieve pending claims
- `POST /claims/approve`: Process approved claims
- `GET /mrf`: List available MRF files
- `GET /mrf/:id`: Retrieve specific MRF file

## Key Features

### 1. CSV Upload and Validation
- Accepts CSV files containing claims data
- Validates file format and data structure using Zod schemas
- Provides immediate feedback on validation errors
- Parses CSV data using Papa Parse library

### 2. Claims Review Interface
- Interactive data grid using AG Grid
- Batch selection for multiple claims
- Column sorting and filtering
- Approval and rejection actions
- Real-time updates via MobX state management

### 3. MRF Generation
- Automatic MRF file generation upon claim approval
- Batches claims into single MRF file when:
  - 10 or more claims are approved
  - End of processing period is reached
- JSON format output with standardized structure
- File metadata tracking (creation date, size, claim count)

### 4. Public MRF Access
- Comprehensive list of generated MRF files
- File metadata display (name, date, size)
- View functionality for immediate inspection
- Download capability for local storage

## State Management

The application uses MobX for state management with a single store (AppStore) handling:
- Pending claims array
- Approved claims tracking
- Rejected claims tracking
- Processing states and loading indicators
- Error states and messages

## Data Flow

1. **Upload Flow**
   ```
   CSV Selection → Parse → Validate → Store → Review
   ```
   - User selects CSV file
   - Papa Parse processes the file
   - Zod validates data structure
   - Valid claims stored in MobX
   - User redirected to review interface

2. **Approval Flow**
   ```
   Select Claims → Approve/Reject → Update Store → Generate MRF
   ```
   - User selects claims in grid
   - Processes approval/rejection
   - Store updates claim status
   - MRF generation triggered when threshold met

3. **Access Flow**
   ```
   Request Files → Display List → View/Download
   ```
   - Fetch MRF file list from API
   - Display in user interface
   - Handle view/download actions

## Security Considerations

- Input validation on both frontend and backend
- File type restrictions (.csv only)
- Data sanitization before processing
- Error handling and logging
- Size limits on file uploads
- Rate limiting on API endpoints

## Future Improvements

1. **Performance Optimizations**
   - Implement virtual scrolling for large datasets
   - Add server-side pagination
   - Implement caching for MRF files
   - Optimize batch processing

2. **Feature Enhancements**
   - Advanced search and filtering
   - Custom validation rules
   - Bulk file processing
   - Export in multiple formats
   - Audit logging

3. **Infrastructure Improvements**
   - Add persistent storage solution
   - Implement user authentication
   - Add role-based access control
   - Set up monitoring and alerting
   - Add automated testing

## Development Practices

1. **Code Quality**
   - TypeScript for type safety
   - ESLint for code quality
   - Prettier for consistent formatting
   - Conventional commits

2. **Testing Strategy**
   - Unit tests for utilities
   - Integration tests for API
   - E2E tests for critical flows

3. **Documentation**
   - Inline code documentation
   - API documentation
   - Setup and deployment guides
   - User documentation

## Conclusion

This application provides a robust solution for managing healthcare claims data and generating Machine Readable Files. Its modular architecture and use of modern technologies ensure maintainability and extensibility for future requirements.