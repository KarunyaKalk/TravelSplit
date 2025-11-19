# Money Splitter App - Design Guidelines

## Design Approach
**Reference-Based with Vacation Vibes**: Drawing inspiration from travel apps (Airbnb, Splitwise) but with a tropical/vacation aesthetic. Balance playful personality with financial trust and clarity.

## Core Design Philosophy
Create a fun, approachable expense-splitting experience that feels like vacation mode - relaxed but organized. Avoid corporate FinTech sterility while maintaining credibility for handling money.

## Typography System
- **Primary Font**: Poppins (Google Fonts) - rounded, friendly, modern
- **Accent Font**: Quicksand (Google Fonts) - for headings, playful touch
- **Hierarchy**:
  - Hero Headlines: text-4xl to text-6xl (Quicksand Bold)
  - Section Titles: text-2xl to text-3xl (Poppins SemiBold)
  - Currency/Numbers: text-3xl to text-5xl (Poppins Bold) - high visual weight for amounts
  - Body Text: text-base to text-lg (Poppins Regular)
  - Labels/Meta: text-sm (Poppins Medium)

## Layout & Spacing System
**Spacing Units**: Use Tailwind units of 3, 4, 6, 8, 12, 16, 20 (p-3, m-4, gap-6, etc.)
- Tight spacing (3-4): Form fields, list items, card internals
- Medium spacing (6-8): Component separation, section padding
- Generous spacing (12-20): Major sections, hero areas

**Container Strategy**:
- Max-width: max-w-6xl for main content
- Full-width cards with inner padding
- Mobile-first: Stack everything on mobile, 2-column grids on tablet+

## Component Library

### Navigation
- Fixed top navigation with slight blur backdrop
- Logo + app name on left, user avatar/menu on right
- Mobile: Hamburger menu with slide-out drawer
- Include subtle shadow for depth

### Authentication Pages (Login/Register)
- Centered card layout (max-w-md)
- Vacation-themed illustration or background image (beach scene, tropical leaves pattern)
- Large, friendly form inputs with icons
- Social login buttons with Replit Auth integration
- Welcoming copy: "Ready to split some vacation bills?"

### Home/Dashboard
- **Hero Section**: Friendly greeting with user name, quick stats overview
- **Group Cards Grid**: 
  - 1 column mobile, 2 columns tablet, 3 columns desktop
  - Each card: Group name, member avatars (overlapping circles), total expenses, subtle shadow on hover
  - "Create New Group" card with dashed border, plus icon
- **Quick Actions Bar**: Floating action button (FAB) for "Add Expense"

### Group Dashboard
- **Header Card**: 
  - Large group name with edit icon
  - Total expenses in prominent display (text-5xl)
  - Member avatars row with "+Add Member" button
- **Expense List**:
  - Card-based layout with timeline/date grouping
  - Each expense: Icon (food, transport, accommodation), title, amount, "paid by" badge
  - Expandable to show split details
  - Use alternating subtle background shades for readability
- **Balance Summary Panel**: 
  - Sticky sidebar on desktop, accordion section on mobile
  - Green text for "gets back", red for "owes"
  - Clear settlement arrows: "You → John: ₹500"

### Add Expense Modal/Page
- Full-screen modal on mobile, centered modal on desktop
- **Form Layout**:
  - Expense title with emoji picker
  - Large amount input with currency symbol
  - "Paid by" dropdown with member avatars
  - "Split with" multi-select checkboxes with member faces
  - Split type toggle: Equal split / Custom amounts
  - Submit button: Full-width, prominent, "Split it!"

### Add Contact/Member Page
- Search bar at top
- User cards with avatar, name, email
- "Add Friend" button per card
- Empty state: Friendly illustration with "Invite your travel buddies!"

### Balance Summary Page
- Clean, organized list view
- Settlement cards showing creditor → debtor relationships
- Grouped by user perspective ("You owe" / "You get")
- Optional "Settle Up" buttons for each transaction
- Export/Share functionality prominent

## Visual Elements

### Icons
- Use Heroicons (outline style for most, solid for active states)
- Travel-themed icons: 🏖️ beach umbrella, ✈️ plane, 🍹 tropical drink, 🎒 backpack
- Financial icons: 💰 money bag, 💳 credit card, 📊 chart
- Action icons: Plus, edit, trash, checkmark

### Illustrations
Include playful spot illustrations throughout:
- Empty states: Beach scene, person relaxing with laptop
- Success confirmations: High-five, celebration
- Loading states: Animated palm tree or suitcase
- 404/Error: Lost tourist with map

### Cards & Surfaces
- Rounded corners: rounded-2xl for major cards, rounded-lg for smaller elements
- Subtle shadows: shadow-md for elevation, shadow-lg for modals
- Border treatment: Use thin borders (border border-opacity-10) for definition
- Glassmorphism effect on overlays: backdrop-blur-sm with semi-transparent backgrounds

### Buttons
- Primary: Large, rounded-full, bold text
- Secondary: Outlined with rounded-full
- Icon buttons: Square/circular with subtle hover scale
- Destructive actions: Maintain rounded style but distinct treatment

### Data Visualization
- Balance bars: Horizontal progress bars showing owed vs. owed-to
- Simple pie chart for expense categories (optional enhancement)
- Use visual weight: larger numbers, bolder fonts for money amounts

### Responsive Behavior
- **Mobile**: Single column, stack all cards, fixed bottom nav for key actions
- **Tablet**: 2-column grids, persistent sidebar for balances
- **Desktop**: 3-column layouts, maximize horizontal space usage

## Interaction Patterns
- Smooth transitions: transition-all duration-300 for hovers and state changes
- Micro-interactions on successful actions (checkmark animation, confetti on split)
- Optimistic UI updates: Show changes immediately, sync in background
- Skeleton loaders for async data with vacation-themed placeholders

## Images & Photography
Include vacation-style imagery strategically:
- **Login/Register background**: Soft-focus beach or tropical scene (full-screen, subtle overlay)
- **Empty states**: Illustrated characters in vacation scenarios
- **Group creation**: Default group images (beach, mountains, city, food themes)
- **User avatars**: Circular frames with colorful fallback gradients

**Critical**: No large hero image on main dashboard - prioritize functional space for groups and expenses.

## Accessibility
- High contrast for financial data (amounts, balances)
- Clear focus states on all interactive elements
- Proper form labels and error messaging
- Touch targets minimum 44px for mobile
- Screen reader friendly balance summaries

## Unique Features to Emphasize
- **Vacation Calculator**: Optional "Trip Budget" feature in groups
- **Photo Receipts**: Upload receipt images with expenses
- **Currency Indicator**: Prominent ₹ symbol throughout
- **Settlement Reminders**: Friendly nudges without being pushy
- **Group Themes**: Let users pick vacation vibes (beach, mountain, city)

This design balances playful vacation aesthetics with the clarity and trust required for financial applications. Every interaction should feel effortless and fun while maintaining precise financial tracking.