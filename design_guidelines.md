# Design Guidelines: Trực Ca AI Operations Monitoring Platform

## Design Approach

**Selected System:** Material Design with enterprise dashboard adaptations

**Rationale:** This is a data-intensive, utility-focused operations monitoring platform requiring clear information hierarchy, real-time status visualization, and complex data management. Material Design provides robust patterns for tables, cards, forms, and status indicators while maintaining professional clarity.

**Core Principles:**
- Information density without clutter
- Instant status recognition through hierarchy and contrast
- Consistent patterns across configuration, monitoring, and reporting modules
- Scannable layouts for rapid decision-making during incidents

---

## Typography System

**Font Families:**
- Primary: Inter (via Google Fonts) - exceptional readability for data-dense interfaces
- Monospace: JetBrains Mono - for log displays, IP addresses, system codes

**Type Scale:**
- Page Headers: text-2xl font-semibold
- Section Titles: text-lg font-medium
- Card Headers: text-base font-medium
- Body Text: text-sm
- Data Tables: text-sm
- Captions/Labels: text-xs font-medium uppercase tracking-wide
- Monospace Data: text-sm font-mono

---

## Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 6, and 8 consistently
- Component padding: p-4, p-6
- Section margins: mb-6, mb-8
- Card spacing: space-y-4
- Form fields: space-y-6
- Grid gaps: gap-4, gap-6

**Grid Patterns:**
- Dashboard widgets: 12-column grid with responsive breakpoints
- Data tables: Full-width with horizontal scroll on mobile
- Forms: 2-column layout on desktop (grid-cols-2 gap-6), single column mobile
- Card grids: grid-cols-1 md:grid-cols-2 lg:grid-cols-3

---

## Component Library

### Navigation & Layout

**Sidebar Navigation (Fixed Left):**
- Width: w-64 on desktop, collapsible to icons on tablet
- Sections: Monitoring Dashboard, Configuration (Khai báo), Schedules, Alerts, Reports
- Active state: Subtle background with left border accent
- Icons: Material Icons for all navigation items

**Top Bar:**
- System status overview strip showing critical metrics
- Current shift information display
- User profile with role badge
- Notification bell with unread count

### Dashboard Components

**Status Cards:**
- Elevated cards (shadow-md) with clear visual hierarchy
- Large numeric indicators for key metrics
- Trend indicators (arrows) for change over time
- Quick action buttons in card footers

**Alert List Widget:**
- Table-based layout with severity badges
- Columns: Timestamp, System, Severity, Message, Status, Actions
- Severity badges: Pill-shaped with distinct visual weights (Down most prominent)
- Expandable rows for detailed log information

**System Monitoring Grid:**
- Card-based grid showing all monitored systems
- Each card: System name, IP, status indicator, recent alerts count
- Visual status: Border-left accent (thick border on left edge)
- Hover: Subtle elevation increase

### Forms & Configuration

**Configuration Forms:**
- Clear section grouping with dividers
- Label-above-input pattern for clarity
- Helper text below inputs for guidance
- Multi-step forms with progress indicator for complex configurations

**Data Tables (Contacts, Groups, Systems):**
- Sticky header for long tables
- Row actions menu (3-dot menu) aligned right
- Inline editing capability for quick updates
- Bulk selection with checkbox column
- Search and filter bar above table

**Alert Rule Builder:**
- Visual expression builder with condition blocks
- Drag-and-drop priority ordering
- Preview pane showing example matches
- Save/Test/Deploy action bar

### Status Indicators

**Severity Badges:**
- Down: Largest, boldest weight
- Critical: Medium-large, bold
- Major: Medium, semi-bold
- Minor: Small, regular
- Clear: Small, subtle

**System Status Icons:**
- Circle indicators (w-3 h-3) with border
- Animated pulse for active alerts
- Grouped badges for multiple simultaneous issues

### Schedules & Calendar

**Shift Calendar View:**
- Week/month toggle
- Color-coded by team/group
- Inline mini-forms for quick shift edits
- Current shift highlighted

---

## Interaction Patterns

**Real-time Updates:**
- Subtle fade-in animation for new alerts
- Toast notifications for critical events (top-right)
- Live badge counters with number increments

**Alert Acknowledgment:**
- Single-click ACK button with confirmation
- Visual strikethrough for acknowledged items
- Auto-dismiss timer for cleared alerts

**Bulk Actions:**
- Sticky action bar appears when items selected
- Clear count of selected items
- Batch operations: Assign, Escalate, Clear

---

## Responsive Strategy

**Desktop (lg+):** Full dashboard layout with sidebar, multi-column grids
**Tablet (md):** Collapsible sidebar to icons, 2-column grids
**Mobile:** Stack all content, bottom navigation, full-width tables with horizontal scroll

---

## Images

**Not Applicable** - This is an enterprise operations dashboard focused on data visualization and monitoring. No hero images or decorative photography needed. All visual elements are functional: charts, graphs, status indicators, and system diagrams.