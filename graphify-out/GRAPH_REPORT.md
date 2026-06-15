# Graph Report - homesteadhill  (2026-06-15)

## Corpus Check
- 124 files · ~2,118,976 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 751 nodes · 1180 edges · 59 communities (55 shown, 4 thin omitted)
- Extraction: 100% EXTRACTED · 0% INFERRED · 0% AMBIGUOUS · INFERRED: 1 edges (avg confidence: 0.8)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `9a40349a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- [[_COMMUNITY_Community 0|Community 0]]
- [[_COMMUNITY_Community 1|Community 1]]
- [[_COMMUNITY_Community 2|Community 2]]
- [[_COMMUNITY_Community 3|Community 3]]
- [[_COMMUNITY_Community 4|Community 4]]
- [[_COMMUNITY_Community 5|Community 5]]
- [[_COMMUNITY_Community 6|Community 6]]
- [[_COMMUNITY_Community 7|Community 7]]
- [[_COMMUNITY_Community 8|Community 8]]
- [[_COMMUNITY_Community 9|Community 9]]
- [[_COMMUNITY_Community 10|Community 10]]
- [[_COMMUNITY_Community 11|Community 11]]
- [[_COMMUNITY_Community 12|Community 12]]
- [[_COMMUNITY_Community 13|Community 13]]
- [[_COMMUNITY_Community 14|Community 14]]
- [[_COMMUNITY_Community 15|Community 15]]
- [[_COMMUNITY_Community 16|Community 16]]
- [[_COMMUNITY_Community 17|Community 17]]
- [[_COMMUNITY_Community 18|Community 18]]
- [[_COMMUNITY_Community 19|Community 19]]
- [[_COMMUNITY_Community 20|Community 20]]
- [[_COMMUNITY_Community 21|Community 21]]
- [[_COMMUNITY_Community 22|Community 22]]
- [[_COMMUNITY_Community 23|Community 23]]
- [[_COMMUNITY_Community 24|Community 24]]
- [[_COMMUNITY_Community 25|Community 25]]
- [[_COMMUNITY_Community 26|Community 26]]
- [[_COMMUNITY_Community 27|Community 27]]
- [[_COMMUNITY_Community 28|Community 28]]
- [[_COMMUNITY_Community 29|Community 29]]
- [[_COMMUNITY_Community 30|Community 30]]
- [[_COMMUNITY_Community 31|Community 31]]
- [[_COMMUNITY_Community 32|Community 32]]
- [[_COMMUNITY_Community 33|Community 33]]
- [[_COMMUNITY_Community 34|Community 34]]
- [[_COMMUNITY_Community 35|Community 35]]
- [[_COMMUNITY_Community 36|Community 36]]
- [[_COMMUNITY_Community 37|Community 37]]
- [[_COMMUNITY_Community 38|Community 38]]
- [[_COMMUNITY_Community 39|Community 39]]
- [[_COMMUNITY_Community 40|Community 40]]
- [[_COMMUNITY_Community 41|Community 41]]
- [[_COMMUNITY_Community 42|Community 42]]
- [[_COMMUNITY_Community 43|Community 43]]
- [[_COMMUNITY_Community 44|Community 44]]
- [[_COMMUNITY_Community 45|Community 45]]
- [[_COMMUNITY_Community 46|Community 46]]
- [[_COMMUNITY_Community 54|Community 54]]
- [[_COMMUNITY_Community 55|Community 55]]
- [[_COMMUNITY_Community 57|Community 57]]
- [[_COMMUNITY_Community 58|Community 58]]
- [[_COMMUNITY_Community 59|Community 59]]

## God Nodes (most connected - your core abstractions)
1. `cn()` - 74 edges
2. `dependencies` - 51 edges
3. `devDependencies` - 18 edges
4. `compilerOptions` - 18 edges
5. `Button` - 18 edges
6. `SEO()` - 16 edges
7. `Footer()` - 16 edges
8. `Header()` - 15 edges
9. `compilerOptions` - 14 edges
10. `useToast()` - 12 edges

## Surprising Connections (you probably didn't know these)
- `cn()` --calls--> `clsx`  [INFERRED]
  src/lib/utils.ts → package.json
- `AlertDialogHeader()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/alert-dialog.tsx → src/lib/utils.ts
- `AlertDialogFooter()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/alert-dialog.tsx → src/lib/utils.ts
- `DrawerHeader()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/drawer.tsx → src/lib/utils.ts
- `DrawerFooter()` --calls--> `cn()`  [EXTRACTED]
  src/components/ui/drawer.tsx → src/lib/utils.ts

## Communities (59 total, 4 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.09
Nodes (33): AdminAuthGate(), AdminAuthGateProps, BookingForm(), RentalApplication, RentalApplicationsAdmin(), statusConfig, StatusFilter, useToast() (+25 more)

### Community 1 - "Community 1"
Cohesion: 0.04
Nodes (51): dependencies, class-variance-authority, clsx, cmdk, date-fns, embla-carousel-react, @hookform/resolvers, input-otp (+43 more)

### Community 2 - "Community 2"
Cohesion: 0.18
Nodes (10): CompositeTypes, Constants, Database, DatabaseWithoutInternals, DefaultSchema, Enums, Json, Tables (+2 more)

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (36): useIsMobile(), Separator, SheetContent, SheetContentProps, SheetDescription, SheetFooter(), SheetHeader(), SheetOverlay (+28 more)

### Community 4 - "Community 4"
Cohesion: 0.11
Nodes (18): devDependencies, autoprefixer, eslint, @eslint/js, eslint-plugin-react-hooks, eslint-plugin-react-refresh, globals, lovable-tagger (+10 more)

### Community 5 - "Community 5"
Cohesion: 0.12
Nodes (22): Action, ActionType, actionTypes, addToRemoveQueue(), dispatch(), genId(), listeners, memoryState (+14 more)

### Community 6 - "Community 6"
Cohesion: 0.12
Nodes (9): NavLink, NavLinkCompatProps, Checkbox, HoverCardContent, Progress, ScrollArea, ScrollBar, Slider (+1 more)

### Community 7 - "Community 7"
Cohesion: 0.1
Nodes (20): compilerOptions, allowImportingTsExtensions, isolatedModules, jsx, lib, module, moduleDetection, moduleResolution (+12 more)

### Community 8 - "Community 8"
Cohesion: 0.16
Nodes (16): cn(), ButtonProps, buttonVariants, Calendar(), CalendarProps, Pagination(), PaginationContent, PaginationEllipsis() (+8 more)

### Community 9 - "Community 9"
Cohesion: 0.22
Nodes (17): adminEmailHtml(), colors, corsHeaders, createHostHubExtensionRequest(), getSiblings(), getUnit(), guestEmailHtml(), handler() (+9 more)

### Community 10 - "Community 10"
Cohesion: 0.12
Nodes (16): aliases, components, hooks, lib, ui, utils, rsc, $schema (+8 more)

### Community 11 - "Community 11"
Cohesion: 0.09
Nodes (33): Footer(), Header(), navLinks, Hero(), trustPoints, ImageLightbox(), ImageLightboxProps, audiences (+25 more)

### Community 12 - "Community 12"
Cohesion: 0.12
Nodes (15): compilerOptions, allowImportingTsExtensions, isolatedModules, lib, module, moduleDetection, moduleResolution, noEmit (+7 more)

### Community 13 - "Community 13"
Cohesion: 0.13
Nodes (9): BlockedRange, corsHeaders, lines, now, pathParts, ranges, supabase, today (+1 more)

### Community 14 - "Community 14"
Cohesion: 0.15
Nodes (13): ALLOWED_ICAL_HOSTS, authHeader, CalendarEvent, corsHeaders, parseIcal(), parseIcalDate(), parseResult, RequestSchema (+5 more)

### Community 15 - "Community 15"
Cohesion: 0.07
Nodes (21): Carousel, CarouselApi, CarouselContent, CarouselContext, CarouselContextProps, CarouselItem, CarouselNext, CarouselOptions (+13 more)

### Community 16 - "Community 16"
Cohesion: 0.15
Nodes (10): ALLOWED_UNIT_SLUGS, corsHeaders, dtstamp, icsDateTimeUtc(), lines, now, pad(), supabase (+2 more)

### Community 17 - "Community 17"
Cohesion: 0.17
Nodes (11): compilerOptions, allowJs, noImplicitAny, noUnusedLocals, noUnusedParameters, paths, skipLibCheck, strictNullChecks (+3 more)

### Community 18 - "Community 18"
Cohesion: 0.29
Nodes (11): BookingRequest, colors, corsHeaders, createHostHubBookingRequest(), getAdminEmailTemplate(), getEmailStyles(), getGuestEmailTemplate(), handler() (+3 more)

### Community 19 - "Community 19"
Cohesion: 0.12
Nodes (15): Command, CommandDialogProps, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator (+7 more)

### Community 20 - "Community 20"
Cohesion: 0.17
Nodes (11): Menubar, MenubarCheckboxItem, MenubarContent, MenubarItem, MenubarLabel, MenubarRadioItem, MenubarSeparator, MenubarShortcut() (+3 more)

### Community 21 - "Community 21"
Cohesion: 0.29
Nodes (10): ApprovalEmailRequest, colors, corsHeaders, formatAmount(), formatDate(), handler(), isEmail(), isIsoDate() (+2 more)

### Community 22 - "Community 22"
Cohesion: 0.18
Nodes (7): ChartConfig, ChartContainer, ChartContext, ChartContextProps, ChartLegendContent, ChartTooltipContent, THEMES

### Community 23 - "Community 23"
Cohesion: 0.25
Nodes (7): NavigationMenu, NavigationMenuContent, NavigationMenuIndicator, NavigationMenuList, NavigationMenuTrigger, navigationMenuTriggerStyle, NavigationMenuViewport

### Community 24 - "Community 24"
Cohesion: 0.27
Nodes (10): colors, corsHeaders, DeclineEmailRequest, escapeHtml(), formatDate(), handler(), isEmail(), isIsoDate() (+2 more)

### Community 25 - "Community 25"
Cohesion: 0.2
Nodes (9): ContextMenuCheckboxItem, ContextMenuContent, ContextMenuItem, ContextMenuLabel, ContextMenuRadioItem, ContextMenuSeparator, ContextMenuShortcut(), ContextMenuSubContent (+1 more)

### Community 26 - "Community 26"
Cohesion: 0.2
Nodes (9): DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuRadioItem, DropdownMenuSeparator, DropdownMenuShortcut(), DropdownMenuSubContent (+1 more)

### Community 27 - "Community 27"
Cohesion: 0.31
Nodes (9): colors, corsHeaders, getAdminNotificationEmail(), getApplicantConfirmationEmail(), handler(), mapSlugToUnitType(), mirrorToHostHub(), prettifyUnitSlug() (+1 more)

### Community 28 - "Community 28"
Cohesion: 0.22
Nodes (8): code:text (Routing), Deliverables, Extend Your Stay — QR-Based Request Flow, How it works for the guest, How it works for you, Out of scope (intentionally), Technical details, What gets built

### Community 29 - "Community 29"
Cohesion: 0.31
Nodes (8): ApprovalEmailRequest, colors, computeNights(), corsHeaders, formatDate(), getApprovalEmailTemplate(), handler(), RESEND_API_KEY

### Community 30 - "Community 30"
Cohesion: 0.22
Nodes (8): AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter(), AlertDialogHeader(), AlertDialogOverlay, AlertDialogTitle

### Community 31 - "Community 31"
Cohesion: 0.22
Nodes (8): Table, TableBody, TableCaption, TableCell, TableFooter, TableHead, TableHeader, TableRow

### Community 32 - "Community 32"
Cohesion: 0.25
Nodes (7): Can I connect a custom domain to my Lovable project?, code:sh (# Step 1: Clone the repository using the project's Git URL.), How can I deploy this project?, How can I edit this code?, Project info, Welcome to your Lovable project, What technologies are used for this project?

### Community 33 - "Community 33"
Cohesion: 0.25
Nodes (7): Breadcrumb, BreadcrumbEllipsis(), BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator()

### Community 34 - "Community 34"
Cohesion: 0.25
Nodes (6): DrawerContent, DrawerDescription, DrawerFooter(), DrawerHeader(), DrawerOverlay, DrawerTitle

### Community 35 - "Community 35"
Cohesion: 0.12
Nodes (12): corsHeaders, baselineMonthlyExpenses, dateRange, months, review, summary, expenses, income (+4 more)

### Community 36 - "Community 36"
Cohesion: 0.25
Nodes (7): SelectContent, SelectItem, SelectLabel, SelectScrollDownButton, SelectScrollUpButton, SelectSeparator, SelectTrigger

### Community 37 - "Community 37"
Cohesion: 0.29
Nodes (6): corsHeaders, query, RESEND_API_KEY, supabase, token, userClient

### Community 38 - "Community 38"
Cohesion: 0.18
Nodes (10): name, private, scripts, build, build:dev, dev, lint, preview (+2 more)

### Community 39 - "Community 39"
Cohesion: 0.33
Nodes (3): ALLOWED_UNIT_SLUGS, corsHeaders, supabase

### Community 40 - "Community 40"
Cohesion: 0.4
Nodes (4): Alert, AlertDescription, AlertTitle, alertVariants

### Community 41 - "Community 41"
Cohesion: 0.16
Nodes (14): ScrollToTop(), ContractorOfficeLaundry(), contractorSupplied, exclusions, InfoCard(), ownerProvided, pricingNotes, ProductLink() (+6 more)

### Community 42 - "Community 42"
Cohesion: 0.5
Nodes (3): Avatar, AvatarFallback, AvatarImage

### Community 54 - "Community 54"
Cohesion: 0.4
Nodes (4): InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot

### Community 55 - "Community 55"
Cohesion: 0.5
Nodes (3): TabsContent, TabsList, TabsTrigger

### Community 57 - "Community 57"
Cohesion: 0.33
Nodes (5): ToggleGroup, ToggleGroupContext, ToggleGroupItem, Toggle, toggleVariants

### Community 58 - "Community 58"
Cohesion: 0.33
Nodes (5): code:bash (supabase secrets set HOMESTEAD_HILL_PL_LIVE_JSON_URL="https:), Current behavior, Homestead Hill P&L live-data endpoint, Live refresh hook, Security

### Community 59 - "Community 59"
Cohesion: 0.67
Nodes (3): Badge(), BadgeProps, badgeVariants

## Knowledge Gaps
- **422 isolated node(s):** `allowJs`, `noImplicitAny`, `noUnusedLocals`, `noUnusedParameters`, `@/*` (+417 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `cn()` connect `Community 8` to `Community 0`, `Community 1`, `Community 3`, `Community 5`, `Community 6`, `Community 11`, `Community 15`, `Community 19`, `Community 20`, `Community 22`, `Community 23`, `Community 25`, `Community 26`, `Community 30`, `Community 31`, `Community 33`, `Community 34`, `Community 36`, `Community 40`, `Community 42`, `Community 54`, `Community 55`, `Community 57`, `Community 59`?**
  _High betweenness centrality (0.243) - this node is a cross-community bridge._
- **Why does `dependencies` connect `Community 1` to `Community 38`?**
  _High betweenness centrality (0.126) - this node is a cross-community bridge._
- **Why does `clsx` connect `Community 1` to `Community 8`?**
  _High betweenness centrality (0.118) - this node is a cross-community bridge._
- **What connects `allowJs`, `noImplicitAny`, `noUnusedLocals` to the rest of the system?**
  _422 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.09 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.04 - nodes in this community are weakly interconnected._
- **Should `Community 3` be split into smaller, more focused modules?**
  _Cohesion score 0.05 - nodes in this community are weakly interconnected._