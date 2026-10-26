import os
import sys
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.units import inch
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

# Numbered canvas for professional running header and footer
class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_number(num_pages)
            super().showPage()
        super().save()

    def draw_page_number(self, page_count):
        if self._pageNumber == 1:
            return  # Skip header/footer on cover/header section
        self.saveState()
        self.setFont("Helvetica-Bold", 8)
        self.setFillColor(colors.HexColor("#64748b"))

        # Running Header
        self.drawString(54, 11 * 72 - 36, "TMS MOBILE APP — VIVA PREPARATION & TECHNICAL GUIDE")
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(54, 11 * 72 - 42, 8.5 * 72 - 54, 11 * 72 - 42)

        # Running Footer
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.setFont("Helvetica", 8)
        self.drawRightString(8.5 * 72 - 54, 32, page_str)
        self.drawString(54, 32, "Confidential — For Academic & Technical Defense Only")
        self.setStrokeColor(colors.HexColor("#cbd5e1"))
        self.setLineWidth(0.5)
        self.line(54, 42, 8.5 * 72 - 54, 42)
        self.restoreState()

def build_pdf(filename="TMS_Mobile_App_Viva_Guide.pdf"):
    pdf_path = os.path.join(os.path.abspath(os.path.dirname(__file__)), filename)
    doc = SimpleDocTemplate(
        pdf_path,
        pagesize=letter,
        leftMargin=50,
        rightMargin=50,
        topMargin=50,
        bottomMargin=50
    )

    styles = getSampleStyleSheet()

    # Color definitions
    PRIMARY = colors.HexColor("#0f172a")     # Slate 900
    SECONDARY = colors.HexColor("#0284c7")   # Sky 600
    ACCENT = colors.HexColor("#4f46e5")      # Indigo 600
    TEXT_DARK = colors.HexColor("#1e293b")   # Slate 800
    TEXT_MUTED = colors.HexColor("#475569")  # Slate 600
    BG_LIGHT = colors.HexColor("#f8fafc")    # Slate 50
    BORDER_COLOR = colors.HexColor("#e2e8f0")# Slate 200
    SUCCESS_COLOR = colors.HexColor("#059669")# Emerald 600

    # Custom typography styles with balanced leading
    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=24,
        leading=28,
        textColor=PRIMARY,
        spaceAfter=6
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=SECONDARY,
        spaceAfter=15
    )

    h1_style = ParagraphStyle(
        'Heading1Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=15,
        leading=19,
        textColor=PRIMARY,
        spaceBefore=14,
        spaceAfter=8,
        keepWithNext=True
    )

    h2_style = ParagraphStyle(
        'Heading2Custom',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=12,
        leading=16,
        textColor=SECONDARY,
        spaceBefore=10,
        spaceAfter=5,
        keepWithNext=True
    )

    body_style = ParagraphStyle(
        'BodyCustom',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=14,
        textColor=TEXT_DARK,
        spaceAfter=6
    )

    bullet_style = ParagraphStyle(
        'BulletCustom',
        parent=body_style,
        leftIndent=14,
        firstLineIndent=-10,
        spaceAfter=4
    )

    question_style = ParagraphStyle(
        'VivaQuestion',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=14,
        textColor=colors.HexColor("#1e3a8a"), # Dark Blue
        spaceBefore=8,
        spaceAfter=3,
        keepWithNext=True
    )

    answer_style = ParagraphStyle(
        'VivaAnswer',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=9.5,
        leading=13.5,
        textColor=TEXT_DARK,
        leftIndent=12,
        spaceAfter=7
    )

    table_header_style = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9,
        leading=12,
        textColor=colors.white
    )

    table_cell_style = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12,
        textColor=TEXT_DARK
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8.5,
        leading=12,
        textColor=PRIMARY
    )

    badge_style = ParagraphStyle(
        'Badge',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=10,
        textColor=colors.HexColor("#0369a1")
    )

    story = []

    # ==========================
    # 1. HEADER BANNER SECTION
    # ==========================
    story.append(Paragraph("TICKET MANAGEMENT SYSTEM (TMS)", title_style))
    story.append(Paragraph("MOBILE APPLICATION — COMPREHENSIVE VIVA VOCE & TECHNICAL DEFENSE GUIDE", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=2, color=SECONDARY, spaceBefore=0, spaceAfter=12))

    meta_info_data = [
        [
            Paragraph("<b>Project Domain:</b> Enterprise Facility & IT Ticket Management", table_cell_style),
            Paragraph("<b>Target Platform:</b> Android & iOS Mobile Application", table_cell_style)
        ],
        [
            Paragraph("<b>Frontend Framework:</b> React Native 0.88 + Expo SDK 58", table_cell_style),
            Paragraph("<b>Backend Architecture:</b> Node.js + Express.js REST API", table_cell_style)
        ],
        [
            Paragraph("<b>Database:</b> MongoDB Atlas Cloud NoSQL (Mongoose ODM)", table_cell_style),
            Paragraph("<b>Security & Session:</b> JWT (JSON Web Tokens) + AsyncStorage", table_cell_style)
        ]
    ]
    meta_table = Table(meta_info_data, colWidths=[255, 255])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), BG_LIGHT),
        ('BOX', (0,0), (-1,-1), 1, BORDER_COLOR),
        ('INNERGRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 14))

    # ==========================================
    # 2. EXECUTIVE PROJECT SUMMARY (WHAT & WHY)
    # ==========================================
    story.append(Paragraph("1. Executive Summary & Problem Statement", h1_style))
    story.append(Paragraph(
        "<b>What is TMS Mobile?</b> TMS Mobile is an enterprise-grade cross-platform mobile application designed to digitize, "
        "automate, and streamline maintenance tickets, hardware failures, networking disruptions, and civil/electrical complaints "
        "across institutional campuses and corporate offices.",
        body_style
    ))
    story.append(Paragraph(
        "<b>Problem Solved:</b> Conventional manual or paper-based complaint registers lead to lost complaints, lack of accountability, "
        "delayed technician assignments, no photo verification of issues, and zero analytical visibility for management. "
        "TMS Mobile provides an instantaneous 4-tier reporting workflow (Department &rarr; Programme &rarr; Block &rarr; Room) "
        "with image capture proofs, instant status tracking, role-based ticket isolation, and real-time administrative intelligence.",
        body_style
    ))
    story.append(Spacer(1, 8))

    # ==========================================
    # 3. CORE LANGUAGES & TECHNOLOGIES
    # ==========================================
    story.append(Paragraph("2. Languages & Technical Stack Used", h1_style))
    story.append(Paragraph(
        "The project is engineered strictly following modern mobile development paradigms. Below is the complete technology breakdown:",
        body_style
    ))

    tech_stack_data = [
        [Paragraph("Category", table_header_style), Paragraph("Technology / Language", table_header_style), Paragraph("Technical Justification / Viva Point", table_header_style)],
        [
            Paragraph("Programming Languages", table_cell_bold),
            Paragraph("JavaScript (ES6+) & JSX", table_cell_style),
            Paragraph("Core programming language for mobile logic, async operations (Promises/async-await), and JSX for declarative native UI.", table_cell_style)
        ],
        [
            Paragraph("Mobile App Framework", table_cell_bold),
            Paragraph("React Native (0.88.0)", table_cell_style),
            Paragraph("Compiles to true native iOS/Android UI components (not a webview). Ensures 60fps high performance and native device API access.", table_cell_style)
        ],
        [
            Paragraph("Toolchain & SDK", table_cell_bold),
            Paragraph("Expo (SDK 58.0.0)", table_cell_style),
            Paragraph("Streamlines compilation, native asset linking, bundling, and over-the-air testing via Expo Go client.", table_cell_style)
        ],
        [
            Paragraph("Navigation Engine", table_cell_bold),
            Paragraph("React Navigation v7 Native Stack", table_cell_style),
            Paragraph("Uses native platform navigation primitives for smooth screen transitions, gestures, and zero-flicker native headers.", table_cell_style)
        ],
        [
            Paragraph("Client Storage", table_cell_bold),
            Paragraph("@react-native-async-storage", table_cell_style),
            Paragraph("Encrypted, asynchronous key-value persistence for offline JWT authentication tokens and persistent user profile caching.", table_cell_style)
        ],
        [
            Paragraph("Camera & Media", table_cell_bold),
            Paragraph("expo-image-picker", table_cell_style),
            Paragraph("Integrates with native device camera and gallery with base64/URI conversion and MIME validation for ticket photo evidence.", table_cell_style)
        ],
        [
            Paragraph("Vector Visualization", table_cell_bold),
            Paragraph("react-native-svg", table_cell_style),
            Paragraph("Custom programmatic native SVG rendering for dynamic interactive Donut Charts and category distribution diagrams.", table_cell_style)
        ],
        [
            Paragraph("Networking / HTTP", table_cell_bold),
            Paragraph("Axios + Interceptors", table_cell_style),
            Paragraph("Handles REST communication, request timeout thresholds, and automatic Bearer JWT injection on every outbound request.", table_cell_style)
        ],
        [
            Paragraph("Backend API Runtime", table_cell_bold),
            Paragraph("Node.js & Express.js", table_cell_style),
            Paragraph("Non-blocking, event-driven RESTful micro-endpoints handling multipart uploads, role checks, and database aggregation.", table_cell_style)
        ],
        [
            Paragraph("Database", table_cell_bold),
            Paragraph("MongoDB Atlas (Cloud NoSQL)", table_cell_style),
            Paragraph("JSON-like flexible BSON document model with Mongoose schemas, ObjectId relationship population, and indexed query speeds.", table_cell_style)
        ]
    ]

    tech_table = Table(tech_stack_data, colWidths=[120, 140, 250])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
    ]))
    story.append(tech_table)
    story.append(Spacer(1, 14))

    # ==========================================
    # 4. APP MODULES (EXACT SCREEN & LOGIC)
    # ==========================================
    story.append(Paragraph("3. Mobile Application Modules (8 Core Modules)", h1_style))
    story.append(Paragraph(
        "The mobile application is modularized into 8 distinct functional units, each dedicated to a critical operational requirement:",
        body_style
    ))

    modules_data = [
        [Paragraph("Module Name", table_header_style), Paragraph("Component File", table_header_style), Paragraph("Core Responsibilities & Technical Highlights", table_header_style)],
        [
            Paragraph("1. Splash & Auto-Session Recovery", table_cell_bold),
            Paragraph("SplashScreen.js<br/>AuthContext.js", table_cell_style),
            Paragraph("Executes on app cold-start. Reads AsyncStorage for existing JWT tokens, fetches user profile from `/api/auth/profile`, and animates pulse logo with native driver while session resolves.", table_cell_style)
        ],
        [
            Paragraph("2. Secure Authentication", table_cell_bold),
            Paragraph("LoginScreen.js", table_cell_style),
            Paragraph("Email and password input validation with eye-toggle password security. Submits credentials to `/api/auth/login`, saves token locally, and triggers conditional navigation to Dashboard.", table_cell_style)
        ],
        [
            Paragraph("3. Role-Aware Dashboard", table_cell_bold),
            Paragraph("DashboardScreen.js", table_cell_style),
            Paragraph("Central operational hub. Shows dynamic summary stats (Pending, In Progress, Resolved). For regular users, displays 'My Raised Tickets'; for SuperAdmin, displays 'Total System Tickets'. Includes quick action cards and Profile Modal.", table_cell_style)
        ],
        [
            Paragraph("4. 4-Tier Ticket Creation", table_cell_bold),
            Paragraph("ComplaintFormScreen.js", table_cell_style),
            Paragraph("Cascading dependent selectors: Department &rarr; Programme &rarr; Block &rarr; Room. Issue type selection chips, description input, and camera/gallery image picker for attachment proof.", table_cell_style)
        ],
        [
            Paragraph("5. Role-Isolated Ticket Center", table_cell_bold),
            Paragraph("ComplaintsListScreen.js", table_cell_style),
            Paragraph("Multi-tab status filter (All, Pending, Assigned, In-Progress, Closed). Enforces strict Role-Based Access: SuperAdmin views all tickets, Regular Users only see tickets they created, Staff only view assigned tasks.", table_cell_style)
        ],
        [
            Paragraph("6. Technician Staff Allocation", table_cell_bold),
            Paragraph("ComplaintsListScreen.js<br/>(Modal Sub-flow)", table_cell_style),
            Paragraph("SuperAdmin privilege. Opens modal to allocate pending complaints to specialized personnel (Plumber, Electrician, Network Staff, PC Hardware, Software Dev). Updates status to 'Assigned'.", table_cell_style)
        ],
        [
            Paragraph("7. Administrative Master Hub", table_cell_bold),
            Paragraph("AdminMasterScreen.js", table_cell_style),
            Paragraph("Enterprise administration center with animated navigation drawer to manage institutional entities: Departments, Programmes, Blocks, Rooms, System Roles, and Registered Users.", table_cell_style)
        ],
        [
            Paragraph("8. Native Analytics & Reports", table_cell_bold),
            Paragraph("ReportsScreen.js", table_cell_style),
            Paragraph("SuperAdmin intelligence dashboard with custom native SVG interactive Donut Charts, resolution rate percentage metrics, category distribution graphs, and volume trends.", table_cell_style)
        ]
    ]

    modules_table = Table(modules_data, colWidths=[130, 110, 270])
    modules_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
    ]))
    story.append(modules_table)
    story.append(Spacer(1, 14))

    # ==========================================
    # 5. KEY PACKAGES USED & PURPOSE
    # ==========================================
    story.append(Paragraph("4. Complete NPM Packages Matrix (mobile/package.json)", h1_style))
    story.append(Paragraph(
        "Here is the verified list of production packages running inside the mobile app:",
        body_style
    ))

    packages_data = [
        [Paragraph("Package Name", table_header_style), Paragraph("Installed Version", table_header_style), Paragraph("Exact Purpose in Mobile App", table_header_style)],
        [Paragraph("expo", table_cell_bold), Paragraph("^58.0.0", table_cell_style), Paragraph("Core Expo client runtime and build tools for cross-platform execution.", table_cell_style)],
        [Paragraph("react-native", table_cell_bold), Paragraph("0.88.0", table_cell_style), Paragraph("Mobile engine providing native components (View, Text, FlatList, Animated).", table_cell_style)],
        [Paragraph("react", table_cell_bold), Paragraph("19.3.0", table_cell_style), Paragraph("React library powering JSX, Hooks, and Component lifecycle.", table_cell_style)],
        [Paragraph("@react-navigation/native", table_cell_bold), Paragraph("^7.0.0 (7.5.1)", table_cell_style), Paragraph("Navigation container and route state manager.", table_cell_style)],
        [Paragraph("@react-navigation/native-stack", table_cell_bold), Paragraph("^7.0.0 (7.21.0)", table_cell_style), Paragraph("Native iOS/Android stack navigator using native screen primitives.", table_cell_style)],
        [Paragraph("@react-native-async-storage/async-storage", table_cell_bold), Paragraph("2.2.0", table_cell_style), Paragraph("Local unencrypted persistent key-value store for user tokens and cache.", table_cell_style)],
        [Paragraph("axios", table_cell_bold), Paragraph("^1.6.8", table_cell_style), Paragraph("HTTP client for API REST calls with request/response interceptors.", table_cell_style)],
        [Paragraph("expo-image-picker", table_cell_bold), Paragraph("~58.0.10", table_cell_style), Paragraph("Native camera and photo library access for defect photographic proof.", table_cell_style)],
        [Paragraph("expo-status-bar", table_cell_bold), Paragraph("~58.0.4", table_cell_style), Paragraph("Controls device top status bar styling (light/dark content).", table_cell_style)],
        [Paragraph("react-native-safe-area-context", table_cell_bold), Paragraph("~5.10.1", table_cell_style), Paragraph("Handles screen cutouts, notch areas, and navigation bars on modern devices.", table_cell_style)],
        [Paragraph("react-native-screens", table_cell_bold), Paragraph("~4.30.0", table_cell_style), Paragraph("Optimizes memory by exposing native UIViewController / Fragment screens.", table_cell_style)],
        [Paragraph("react-native-svg", table_cell_bold), Paragraph("15.16.0", table_cell_style), Paragraph("Enables SVG rendering for interactive donut charts and vector graphics.", table_cell_style)],
        [Paragraph("react-native-web", table_cell_bold), Paragraph("^0.21.4", table_cell_style), Paragraph("Allows React Native components to render in web browsers if needed.", table_cell_style)]
    ]

    pkg_table = Table(packages_data, colWidths=[170, 90, 250])
    pkg_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 3.5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 3.5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
    ]))
    story.append(pkg_table)
    story.append(Spacer(1, 14))

    # ==========================================
    # 6. ARCHITECTURE & LIFECYCLE
    # ==========================================
    story.append(Paragraph("5. System Architecture & Ticket Lifecycle", h1_style))
    story.append(Paragraph(
        "<b>Ticket State Machine:</b> Complaints undergo four distinct lifecycle stages governed by strict role permissions:",
        body_style
    ))

    lifecycle_data = [
        [Paragraph("Status Stage", table_header_style), Paragraph("Trigger / Action", table_header_style), Paragraph("Authorized Actor", table_header_style), Paragraph("Technical Next Step", table_header_style)],
        [
            Paragraph("1. PENDING", table_cell_bold),
            Paragraph("Ticket submitted via mobile form with location and optional photo attachment.", table_cell_style),
            Paragraph("Regular User", table_cell_style),
            Paragraph("Stored in MongoDB with `status: 'Pending'`. Awaits SuperAdmin review.", table_cell_style)
        ],
        [
            Paragraph("2. ASSIGNED", table_cell_bold),
            Paragraph("SuperAdmin selects appropriate technician from staff directory.", table_cell_style),
            Paragraph("SuperAdmin", table_cell_style),
            Paragraph("`PATCH /api/complaints/:id/assign`. Updates `assignedTo: staffId` and `status: 'Assigned'`.", table_cell_style)
        ],
        [
            Paragraph("3. IN-PROGRESS", table_cell_bold),
            Paragraph("Assigned technician starts repair work and updates ticket status.", table_cell_style),
            Paragraph("Assigned Staff / Admin", table_cell_style),
            Paragraph("`PATCH /api/complaints/:id/status`. Marks issue under active rectification.", table_cell_style)
        ],
        [
            Paragraph("4. CLOSED / RESOLVED", table_cell_bold),
            Paragraph("Physical issue solved and verified by technician, user, or SuperAdmin.", table_cell_style),
            Paragraph("Creator / Staff / Admin", table_cell_style),
            Paragraph("Marks `status: 'Closed'`. Included in completed analytics reports.", table_cell_style)
        ]
    ]

    lifecycle_table = Table(lifecycle_data, colWidths=[90, 160, 100, 160])
    lifecycle_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
    ]))
    story.append(lifecycle_table)
    story.append(Spacer(1, 14))

    # ==========================================
    # 7. TOP 20 VIVA QUESTIONS & MODEL ANSWERS
    # ==========================================
    story.append(Paragraph("6. Top 20 Viva Voce Questions & Technical Answers", h1_style))
    story.append(Paragraph(
        "Study these 20 high-yield questions carefully. Examiners frequently focus on architectural decisions, security, and state management:",
        body_style
    ))

    viva_qas = [
        (
            "Q1: Why did you choose React Native instead of a hybrid Web/WebView approach (like Ionic or Cordova)?",
            "React Native renders real, native Android and iOS UI widgets (via Native Modules and Fabric renderer) rather than running inside an embedded webview. This provides true 60fps scrolling, fluid animations using the Native Driver, direct access to camera/hardware APIs without lag, and a seamless native user experience."
        ),
        (
            "Q2: What is Expo and why is it used in this project?",
            "Expo is an open-source framework and platform for React Native. It abstracts native Android/iOS build toolchains, simplifies dependency management, provides battle-tested native APIs (like expo-image-picker and expo-status-bar), and enables instant testing on physical devices via Expo Go."
        ),
        (
            "Q3: Why did you upgrade the project to Expo SDK 58 and React Navigation v7?",
            "Expo SDK 58 adopted React 19 and React Native 0.88. React 19 introduced architectural breaking changes (such as stricter prop typing, removal of legacy context APIs, and refactoring of ref forwarding). Older React Navigation v6 packages crashed on load under React 19. Upgrading to React Navigation v7 resolved all compatibility bottlenecks and ensured zero runtime crashes."
        ),
        (
            "Q4: How does user authentication work in TMS Mobile?",
            "We implement stateless JWT (JSON Web Token) authentication. When the user enters their email and password on LoginScreen, the credentials are sent via POST to `/api/auth/login`. The server verifies the password against a bcrypt salt-hash in MongoDB and returns a signed JWT containing the user's ID and role. The mobile app stores this token in `@react-native-async-storage/async-storage`."
        ),
        (
            "Q5: How does the mobile app attach the JWT token to subsequent API requests?",
            "Through an Axios Request Interceptor defined in `mobile/src/config/api.js`. Before every outgoing HTTP request, the interceptor asynchronously retrieves the token from AsyncStorage and injects it into the HTTP headers as `Authorization: Bearer <token>`. The backend middleware verifies this token before allowing route execution."
        ),
        (
            "Q6: How is Role-Based Access Control (RBAC) enforced between SuperAdmin and Regular Users?",
            "RBAC is enforced at two distinct levels: 1) Backend Level: In `complaintController.js`, `listComplaints` checks `req.user.role`. If SuperAdmin, it returns all records. If a regular user, the MongoDB query is strictly filtered to `{ createdBy: requester.id }`. 2) Mobile UI Level: In `ComplaintsListScreen.js`, client-side filters further verify user ownership, and action buttons like 'Assign Staff' are conditionally rendered only for SuperAdmin."
        ),
        (
            "Q7: Explain the Cascading Dropdown mechanism in ComplaintFormScreen.",
            "The screen uses a 4-level dependent selection hierarchy: Department &rarr; Programme &rarr; Block &rarr; Room. When a user selects a Department, an effect hook fetches programmes linked to that `departmentId`. Selecting a programme loads corresponding blocks, and selecting a block dynamically filters available rooms. This eliminates human error and guarantees location accuracy."
        ),
        (
            "Q8: How are image attachments uploaded from the mobile device to the server?",
            "When the user selects or snaps a photo using `expo-image-picker`, the app receives a local file URI. The app constructs a standard `FormData` object containing the image URI, MIME type (`image/jpeg`), and generated filename along with ticket metadata. It is sent via POST to `/api/complaints` with `Content-Type: multipart/form-data`, where Multer middleware saves it to the backend `uploads/` directory."
        ),
        (
            "Q9: What is React Context API and why was it used instead of Redux?",
            "React Context API (`AuthContext.js`) provides centralized global state without prop-drilling. For this application's state requirements (user profile, authentication status, login/logout actions), Context API is lightweight, built directly into React, requires zero external boilerplate, and does not incur the heavy memory footprint of Redux."
        ),
        (
            "Q10: What is AsyncStorage and what are its limitations?",
            "AsyncStorage is an asynchronous, unencrypted, persistent key-value storage system for React Native. We use it to store the JWT string and basic session flags. Its limitation is that it is not intended for large datasets or highly sensitive unencrypted secrets, which is why we only store the temporary auth token, not passwords."
        ),
        (
            "Q11: How does the mobile app draw graphs in ReportsScreen without external charting libraries?",
            "We built a custom SVG Donut/Pie chart component using `react-native-svg`. It calculates angles using trigonometric formulas (`Math.cos` and `Math.sin`), generating SVG arc paths (`d='M... A...'`) for each complaint category slice. This guarantees zero bloat, native vector rendering, and responsive scaling across any device resolution."
        ),
        (
            "Q12: How are passwords secured in the database?",
            "Passwords are never stored in plaintext. In `authController.js`, we use `bcryptjs` with 10 salt rounds (`bcrypt.hash(password, 10)`). During login, `bcrypt.compare()` compares the plain credential against the one-way hash, preventing credential theft even in the event of database inspection."
        ),
        (
            "Q13: How does the mobile app communicate with the local development backend?",
            "In `mobile/src/config/api.js`, the base URL is configured with the host computer's Local Area Network IP address (e.g., `http://10.249.68.142:5000/api`). This allows both the physical mobile device and the computer to talk over the same Wi-Fi subnet without relying on internet tunneling."
        ),
        (
            "Q14: What is the purpose of `useNativeDriver: true` in your animations?",
            "In `SplashScreen.js` and `LoginScreen.js`, `useNativeDriver: true` offloads animation calculation (such as opacity and scale) from the single-threaded JavaScript thread to the native UI thread (RenderThread). This ensures that even if the JS thread is busy loading data, the logo pulse animation remains perfectly smooth."
        ),
        (
            "Q15: What Mongoose models exist in the backend supporting the app?",
            "There are 7 Mongoose schemas: `User` (credentials, role, department), `Complaint` (location, type, remarks, photo, status, createdBy, assignedTo), `Department`, `Programme`, `Block`, `Room`, and `Role`."
        ),
        (
            "Q16: How does the application handle error handling and network failures?",
            "Axios calls are wrapped in `try/catch` blocks. In `api.js`, timeout is set to 10000ms. If a network failure occurs, the UI displays informative `Alert.alert` dialogs, catch fallbacks prevent UI crashes, and pull-to-refresh (`RefreshControl`) allows immediate retries."
        ),
        (
            "Q17: What is the difference between `useEffect`, `useState`, and `useMemo` in your screens?",
            "`useState` manages local reactive state (e.g., entered text, ticket list). `useEffect` handles side-effects (e.g., fetching complaints on screen load or filter change). `useMemo` memoizes expensive calculations (e.g., summing ticket totals for SVG chart slices so it doesn't recalculate on every render)."
        ),
        (
            "Q18: What is `react-native-safe-area-context` and why is it essential?",
            "Modern smartphones feature screen notches, dynamic islands, rounded display corners, and bottom gesture bars. `react-native-safe-area-context` programmatically detects these hardware insets and provides padding so UI elements (buttons, inputs) are never clipped or obscured."
        ),
        (
            "Q19: Can a SuperAdmin raise a complaint in your system?",
            "By design, SuperAdmins are restricted from raising complaints; their duty is supervisory, administrative, and allocation-focused. If a SuperAdmin attempts to raise a complaint, the backend controller rejects the request with HTTP 403 ('Super Admin cannot raise complaints'). Regular users raise tickets."
        ),
        (
            "Q20: What are 3 prominent future enhancements you would add to TMS Mobile?",
            "1) Push Notifications via Expo Notifications / Firebase Cloud Messaging (FCM) to alert users when a ticket status changes. 2) Real-time technician live chat via WebSockets (Socket.io). 3) In-app Barcode / QR Code scanning on classroom doors to instantly autofill block and room numbers."
        )
    ]

    for q, a in viva_qas:
        story.append(Paragraph(q, question_style))
        story.append(Paragraph(f"<b>Answer:</b> {a}", answer_style))
        story.append(Spacer(1, 3))

    # ==========================================
    # 8. EMERGENCY CHEAT SHEET FOR VIVA MORNING
    # ==========================================
    story.append(Spacer(1, 10))
    story.append(Paragraph("7. Quick Viva Morning 'Cheat Sheet' (Key Buzzwords)", h1_style))
    
    cheat_sheet_data = [
        [Paragraph("Topic", table_header_style), Paragraph("Key Technical Phrases to Speak to the Examiner", table_header_style)],
        [
            Paragraph("Frontend Architecture", table_cell_bold),
            Paragraph("• Component-driven React Native architecture<br/>• Declarative JSX, Context API state management<br/>• Zero-webview, compiled directly to native Android/iOS primitives", table_cell_style)
        ],
        [
            Paragraph("Security & Auth", table_cell_bold),
            Paragraph("• Stateless JSON Web Token (JWT) architecture<br/>• Password hashing with BCrypt (10 rounds)<br/>• Axios request interceptors inject Bearer token automatically<br/>• Persistent session management via AsyncStorage", table_cell_style)
        ],
        [
            Paragraph("Data Isolation & RBAC", table_cell_bold),
            Paragraph("• Dual-layer Role Based Access Control (Server query filter + Client UI filter)<br/>• SuperAdmin = Global visibility & Staff assignment<br/>• Regular User = Isolated view of own submitted tickets (`createdBy == req.user.id`)<br/>• Staff = Restricted to assigned maintenance issues", table_cell_style)
        ],
        [
            Paragraph("Engineering Challenge Solved", table_cell_bold),
            Paragraph("• Upgraded to Expo SDK 58 & React Navigation v7 to resolve React 19 breaking changes.<br/>• Optimized Metro bundler compilation for 994 native modules with zero compilation errors.", table_cell_style)
        ]
    ]

    cheat_table = Table(cheat_sheet_data, colWidths=[140, 370])
    cheat_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), PRIMARY),
        ('ALIGN', (0,0), (-1,-1), 'LEFT'),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('GRID', (0,0), (-1,-1), 0.5, BORDER_COLOR),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, BG_LIGHT]),
    ]))
    story.append(cheat_table)
    story.append(Spacer(1, 14))

    # Build the PDF
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"PDF successfully generated at: {pdf_path}")
    return pdf_path

if __name__ == "__main__":
    build_pdf()
