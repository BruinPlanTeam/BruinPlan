# BruinPlan: UCLA 4-Year Class Planner

BruinPlan helps UCLA Engineering students plan their 4-year degree path. You can drag and drop courses into a quarterly schedule, see which prerequisites you need, and track your progress toward graduation.

## What It Does

The app lets you search for your major, see all the required classes, and build a plan by dragging courses into quarters. It checks prerequisites automatically and warns you if you're taking too many units. You can save multiple plans and switch between them.

### Main Features

**Course Planning**
- See all required courses for your major loaded from our database
- Drag courses into a 4-year quarterly schedule
- System blocks you from adding classes if you haven't taken prerequisites
- Get warnings if a quarter goes over 21 units

**Progress Tracking**
- See how much of your degree you've completed
- Track progress by requirement type (Lower Division, Upper Division, GE, etc.)

**Saving Plans**
- Create an account to save your plans
- Save multiple plans and switch between them
- Your plans are stored in the database

**Search**
- Search for majors with real-time suggestions
- Results are ranked by relevance (exact matches first, then partial matches)

## How It's Built

The frontend is React with Vite. We use React Router for navigation and @dnd-kit for the drag-and-drop functionality. State is managed with React Context (for auth and major selection) and custom hooks for different features.

The backend is Express.js with Prisma as our ORM. We use MySQL for the database. Authentication uses JWT tokens, and passwords are hashed with bcrypt.

We organized the code into custom hooks so each piece has a clear responsibility. API calls go through service functions, and protected routes use JWT middleware.

## Architecture Diagrams

### 1. Component Structure Diagram

This diagram shows how React components and hooks are organized and how they interact with each other.

![Component Structure Diagram](diagrams/ComponentStructureDiagram.png)

Owen u gotta add this

i didnt wanna leave this blank so asked ai to make a random paragraph idk how well it aligns with yours
The App component wraps everything with AuthProvider and MajorProvider for global state management. The DegreePlan page uses the usePlanManager hook, which coordinates useCategorizedCourses (fetches and categorizes courses), useDragAndDrop (handles the drag-and-drop logic), and useCourseValidation (checks prerequisites). PlanGrid renders the 4×4 grid of quarters, and CourseSidebar displays the categorized courses. Components like SavePlanButton, SavedPlansButton, and ProgressBar interact with the plan manager to provide the full functionality.

### 2. Database Schema Diagram

This ER diagram shows how the database tables relate to each other.

![Database Schema Diagram](diagrams/DatabaseSchemaDiagram.png)

Ciaran u gotta add this

i didnt wanna leave this blank either so also asked ai to make a random paragraph idk how well it aligns with yours
Users can have multiple Plans. Each Plan belongs to one Major and has multiple Quarters. Each Quarter has multiple PlanClasses, which link to Class records. Majors have Requirements through MajorRequirement, and Requirements link to Classes through RequirementClasses. Classes can have Prerequisites pointing to other Classes. The schema supports complex prerequisite relationships and tracks which classes fulfill which requirements.

### 3. Application State Diagram

This shows the different states the application can be in and how it transitions between them.

![Application State Diagram](diagrams/StateDiagram.png)

The application starts at HomeScreen where users can search for majors. Selecting a major transitions to LoadingPlan, then to PlanReady where users can drag and drop courses. The PlanReady state includes nested states for dragging, validating drops, saving plans, and browsing saved plans. Users can also authenticate from HomeScreen, which transitions to the Authenticating state.

### 4. Major Search Sequence Diagram

This sequence diagram shows how major search and course data retrieval works.

![Major Search Sequence Diagram](diagrams/MajorSearchSequenceDiagram.png)

When a user types in the search bar, the app fetches all majors from the server. The server queries the database through Prisma and returns a list of major names. The client filters and ranks suggestions locally. When a user selects a major, the app navigates to the degree plan page and fetches detailed course data including classes, requirements, and prerequisites. The server performs complex joins to retrieve all related data and transforms it into the format the client needs.

### 5. Authentication Sequence Diagram

This sequence diagram shows how user authentication (signup and login) works.

![Authentication Sequence Diagram](diagrams/AuthSequenceDiagram.png)

For signup, the client sends user credentials to the server, which hashes the password with bcrypt and creates a user record in the database. After successful signup, the app automatically logs the user in. For login, the server compares the provided password with the stored hash, and if valid, generates a JWT token. The client stores the token and user data in localStorage for future authenticated requests.

### 6. Plan Saving Sequence Diagram

This sequence diagram shows how plans are saved, retrieved, and loaded.

![Plan Saving Sequence Diagram](diagrams/PlanSavingSequenceDiagram.png)

When saving a plan, the client serializes the drag-and-drop zones into a quarters array and sends it to the server with authentication. The server validates the JWT token, looks up the major, and creates the plan with nested quarters and plan classes in a database transaction. When browsing plans, the server fetches all plans for the authenticated user with all related data. When loading a plan, the client deserializes the quarters back into the zone structure and updates the UI.


## Getting Started

### What You Need

- Node.js (v18 or higher)
- npm
- MySQL database
- The `.env` file (ask a team member for it)

### Setup

1. **Clone the repo**
   ```bash
   git clone <repository-url>
   cd BruinPlan
   ```

2. **Set up the server**
   ```bash
   cd server
   npm install
   npx prisma generate
   ```
   
   You'll need a `.env` file in the `server/` folder with your database info:
   ```env
   DB_HOST=your_database_host
   DB_USER=your_database_user
   DB_PASS=your_database_password
   DB_NAME=your_database_name
   DB_PORT=your_database_port
   DB_URL=mysql://user:password@host:port/database
   ACCESS_TOKEN_SECRET=your_jwt_secret_key
   ```

3. **Set up the client**
   ```bash
   cd ../client
   npm install
   ```

### Running It

1. **Start the server** (in one terminal)
   ```bash
   cd server
   node server.js
   ```
   You should see "Server running on port 3000" and "Connected to MySQL successfully."

2. **Start the client** (in another terminal)
   ```bash
   cd client
   npm run dev
   ```
   It'll run on `http://localhost:5173`

3. **Open it in your browser**
   - Go to `http://localhost:5173`
   - Search for a major (try "Computer Science")
   - Start building your plan

## Project Structure

```
BruinPlan/
├── client/
│   ├── src/
│   │   ├── components/        # React components
│   │   │   ├── ai/          # AI chat stuff
│   │   │   ├── ui/          # Reusable UI components
│   │   │   └── ...          # Other components
│   │   ├── contexts/        # React contexts (AuthContext)
│   │   ├── hooks/           # Custom hooks
│   │   ├── pages/           # Page components
│   │   ├── providers/       # Context providers
│   │   ├── services/        # API service functions
│   │   └── utils/           # Helper functions
│   └── package.json
├── server/
│   ├── app.js              # Express routes
│   ├── server.js           # Entry point
│   ├── prisma/
│   │   ├── schema.prisma   # Database schema
│   │   └── migrations/     # DB migrations
│   ├── features/           # Cucumber tests
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication

**POST /users** - Create account
```json
{
  "email": "user@example.com",
  "username": "username",
  "password": "password123"
}
```
Returns 201 with user data (no password).

**POST /users/login** - Log in
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```
Returns 200 with user object and JWT token.

### Major Data

**GET /majors** - Get all majors
Returns array of major names: `["Computer Engineering", "Computer Science", ...]`

**GET /majors/:majorName** - Get major details
Returns courses and requirements for that major:
```json
{
  "availableClasses": [...],
  "majorRequirements": [...]
}
```

### Plans (Requires Authentication)

**POST /plans** - Save a plan
Headers: `Authorization: Bearer <token>`
Body:
```json
{
  "name": "My Plan",
  "majorName": "Computer Science",
  "quarters": [
    {
      "quarterNumber": 1,
      "classIds": [1, 2, 3]
    }
  ]
}
```

**GET /plans** - Get your saved plans
Headers: `Authorization: Bearer <token>`
Returns array of your plans with all the quarter and class data.

## Testing

We have end-to-end tests using Cucumber. Run them with:

```bash
cd server
npm test
```

The tests cover user creation and login. They're in `server/features/` with step definitions in `server/features/step_definitions/`.

## Troubleshooting

**Database connection fails**
- Make sure the `.env` file exists in `server/`
- Check your database credentials
- Make sure MySQL is running
- Verify the database exists and your user has permissions

**Module not found errors**
- Run `npm install` in both `client/` and `server/` directories

**Prisma errors**
- Run `npx prisma generate` in the `server/` directory

**Port 3000 already in use**
- Kill whatever's using port 3000, or change the port in `server/server.js`

**CORS errors**
- Make sure the client is running on `http://localhost:5173`
- Check the CORS config in `server/app.js` matches your client URL

---

Built for CS35L at UCLA. BruinPlan Team on top: Owen Battles, Ciaran Turner, Atri Pandya, Conor Parman
