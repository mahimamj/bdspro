# BDS PRO Dashboard Structure

## Overview
The BDS PRO dashboard is a modern, clean financial management interface with a sidebar navigation and main content area displaying user financial metrics and transaction history.

## Layout Structure

### 1. Header Section
```
┌─────────────────────────────────────────────────────────────┐
│ [B] BDS PRO                                    [J] John Doe │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Components:**
- **Logo**: Purple square with white 'B' + "BDS PRO" text
- **User Profile**: "John Doe" + "john@example.com" + circular purple avatar with 'J'

### 2. Sidebar Navigation (Left Panel)
```
┌─────────────┐
│    Menu     │
├─────────────┤
│ 📊 Dashboard│ ← Active (highlighted)
│ 👤 My Account│
│ 👥 My Referral│
│ 💰 Withdrawal│
│ 🚪 Logout   │
└─────────────┘
```

**Navigation Items:**
- **Dashboard** (Active) - Line graph icon
- **My Account** - Person icon
- **My Referral** - Two-person icon
- **Withdrawal** - Dollar sign icon
- **Logout** - Arrow pointing out icon

### 3. Main Content Area (Right Panel)

#### 3.1 Page Header
```
Dashboard
Welcome back, John Doe!
Here's an overview of your BDS PRO account
```

#### 3.2 Financial Metrics Cards (2x3 Grid)
```
┌─────────────────┬─────────────────┬─────────────────┐
│ 💰 Account      │ 📈 Total        │ 👥 My Level 1   │
│    Balance      │    Earnings     │    Income       │
│    $0.00        │    $0.00        │    $0.00        │
└─────────────────┴─────────────────┴─────────────────┘
┌─────────────────┬─────────────────┬─────────────────┐
│ 🎁 Rewards      │ 💵 My Level 1   │ 👥 My Level 2   │
│    $0.00        │    Business     │    Income       │
│                 │    $0.00        │    $0.00        │
└─────────────────┴─────────────────┴─────────────────┘
```

**Card Details:**
1. **Account Balance** - Purple wallet icon
2. **Total Earnings** - Purple trending-up icon
3. **My Level 1 Income** - Purple two-person icon
4. **Rewards** - Purple gift box icon
5. **My Level 1 Business** - Purple dollar sign icon
6. **My Level 2 Income** - Purple two-person icon

#### 3.3 Recent Transactions Section
```
Recent Transactions
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│              No recent transactions                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

## Color Scheme
- **Primary**: Purple (#8B5CF6)
- **Background**: Light grey/white
- **Text**: Dark grey/black
- **Active State**: Light blue highlight

## Responsive Design
- **Sidebar**: Fixed width, collapsible
- **Main Content**: Flexible width with scrollbar
- **Cards**: Responsive grid layout (2x3 on desktop)

## Interactive Elements
- **Navigation**: Clickable sidebar items with active state
- **Cards**: Clickable financial metric cards
- **User Profile**: Clickable user information area
- **Scrollbar**: Vertical scroll for additional content

## Data Display
- **Current State**: All values show "$0.00" (mock data)
- **Transaction History**: "No recent transactions" (empty state)
- **User Info**: "John Doe" / "john@example.com" (demo user)

## Technical Implementation
- **Frontend**: React with modern UI components
- **Styling**: Clean, minimal design with purple accent
- **Icons**: Lucide React icons
- **Layout**: CSS Grid/Flexbox for responsive design
- **State Management**: React Context for user authentication
