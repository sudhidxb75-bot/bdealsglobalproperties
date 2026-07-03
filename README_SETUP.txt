Bdeals Global Properties - Real Estate Mediator Website Package V1
========================================================

This package contains a complete low-cost website and backend model for a real estate mediator platform.

Main concept
------------
The website connects property sellers and buyers through a controlled platform. Buyers and sellers do not directly contact each other. Seller phone numbers, buyer details, exact property address, documents, negotiation limits, and commission details remain protected in the backend.

Package contents
----------------
1. Public website files
   - index.html
   - buy-property.html
   - sell-property.html
   - post-requirement.html
   - builders.html
   - how-it-works.html
   - services.html
   - contact.html
   - property-details.html
   - css/style.css
   - js/config.js
   - js/main.js

2. Backend files
   - apps-script/Code.gs

3. Google Sheets reference
   - google-sheets/*.csv header files

4. Documentation
   - docs/WEBSITE_ARCHITECTURE.txt
   - docs/PRIVACY_POLICY_DRAFT.txt

First setup steps
-----------------
1. Upload the website files to GitHub Pages.
2. Create a new Google Sheet.
3. Open Extensions > Apps Script.
4. Paste the content of apps-script/Code.gs.
5. Save the Apps Script project.
6. Run setupSheets() once.
7. Authorize the script.
8. Deploy > New deployment > Web app.
9. Select:
   Execute as: Me
   Who has access: Anyone
10. Copy the Web App URL.
11. Open js/config.js.
12. Paste the Web App URL here:
    const APPS_SCRIPT_URL = "YOUR_WEB_APP_URL";
13. Replace placeholder phone/email/company details in the website files.
14. Re-upload the revised files to GitHub Pages.

How to make a property visible on the website
---------------------------------------------
In the Properties sheet:
1. Set VerificationStatus = Verified
2. Set PublicStatus = Show
3. Set Status = Listed
4. Set Featured = Yes if it should appear on the home page.
5. Fill public-safe fields only:
   PropertyCode, PropertyType, Area, Locality, SizeText, PublicPriceRange, Description, Highlights, ImageURL.

Do not put private details in public fields.

Important compliance note
-------------------------
Before public launch, consult a legal advisor regarding real estate brokerage rules, RERA requirements where applicable, privacy policy, terms of service, commission agreements, and document handling.


Backend-controlled sliding banners
----------------------------------
This version includes a home page banner slider controlled from the Google Sheets backend.

A new sheet named Banners is included with these fields:
BannerID, Title, Subtitle, Badge, ButtonText, ButtonLink, ImageURL, SortOrder, StartDate, EndDate, Status, Remarks.

How to show a banner:
1. Open the Banners sheet.
2. Add banner title, subtitle, button text, button link, and image URL.
3. Set SortOrder as 1, 2, 3 etc.
4. Set Status = Active.
5. Optional: use StartDate and EndDate to schedule banners.
6. Refresh the website.

Recommended banner image size:
1920 x 520 px for desktop.
For mobile-safe design, keep important text in the center-left area and avoid placing critical text inside the image itself.



V1.2 updates
------------
This version includes:

1. Country selection with location
   - Country dropdown is loaded from the Countries sheet.
   - Forms now include country and location fields.

2. Customer signup/login
   - Visible public page: customer-login.html
   - Customer dashboard: customer-dashboard.html
   - Customer session is stored in browser localStorage for the MVP version.
   - Backend sheet: Customers

3. Refer & Win
   - Visible public page: refer-and-win.html
   - Logged-in customers can also submit referrals from customer-dashboard.html.
   - Backend sheet: Referrals
   - Admin can update Status, RewardStatus, and RewardAmount.

4. Hidden seller login/dashboard
   - Direct seller login URL: seller-login.html
   - Direct seller dashboard URL: seller-dashboard.html
   - These are not linked in the public website menu.
   - Seller dashboard shows only the seller's own submitted property status.
   - Seller passwords are stored as SHA-256 hashes in Google Sheets for this MVP version.

5. Admin dashboard
   - Admin remains hidden from frontend.
   - Admin control is through Google Sheets and Apps Script menu only.

Important security note
-----------------------
This is a low-cost MVP login system using Google Sheets and Apps Script. For a live real estate marketplace, upgrade later to OTP login, Firebase Auth, Supabase Auth, or a proper server-side authentication system.



V1.2 deployment notes
---------------------
After pasting apps-script/Code.gs:
1. Run setupSheets() once.
2. Use the Apps Script menu "Real Estate Mediator".
3. Run Seed Sample Banners if needed.
4. Run Seed Sample Properties if needed.
5. Deploy as Web App.
6. Paste the Web App URL in js/config.js.

Hidden dashboard URLs:
- Seller login: seller-login.html
- Seller dashboard: seller-dashboard.html

These seller pages are intentionally not linked in the public menu.
Admin dashboard remains fully hidden from frontend and is managed through Google Sheets only.



V1.3 updates
------------
1. Header menu layout
   - Revised to match the attached wide desktop header style.
   - Main menu remains clean: Home, Buy Property, Sell Property, Post Requirement, Builders, How It Works, Services, Contact.
   - Customer Login / Signup is now shown as a login icon on the right side of the header.
   - Refer & Win is moved away from the header and placed as a homepage CTA and separate page.

2. Portal structure
   - Customer portal: visible through the login icon.
   - Seller portal: hidden from frontend menu, accessible only by direct URL:
     seller-login.html
     seller-dashboard.html
   - Admin portal/backend: remains hidden from frontend and is managed through Google Sheets + Apps Script.

3. Seller property upload workflow
   - Sellers can login and submit property details from seller-dashboard.html.
   - Sellers can paste property photo URLs and document URLs.
   - New seller-submitted properties are saved as:
     VerificationStatus = Pending
     PublicStatus = Hide
     Status = Pending admin approval
   - Admin must verify, edit, approve, and publish by changing:
     VerificationStatus = Verified
     PublicStatus = Show
     Status = Listed

4. Backend proposal workflow
   - New backend sheet: Proposals.
   - Admin can prepare proposals to clients from the backend.
   - Fill a row in the Proposals sheet, select that row, then use:
     Real Estate Mediator > Create Proposal Document
   - The system creates a Google Doc proposal and saves the document URL in ProposalDocURL.
   - Proposal status, sent date, follow-up date, client response, deal ID, and remarks can be tracked in the same sheet.



V1.3.1 update
-------------
- Reduced header brand font size.
- Reduced menu font size.
- Reduced menu spacing.
- Improved desktop menu alignment.
- Customer login remains as an icon on the right side.



V1.3.2 reports, print sheets, and archiving
-------------------------------------------
Admin-only backend tools added to the Apps Script menu:

1. Generate Report Dashboard
   Creates / refreshes the Report Dashboard sheet with counts for:
   - Total properties
   - Pending property verification
   - Published properties
   - Total buyers and sellers
   - New enquiries
   - Buyer requirements
   - Referrals and reward status
   - Proposals
   - Deals and commission status

2. Generate Print Sheets
   Creates print-ready working sheets:
   - Print - New Enquiries
   - Print - Property Review
   - Print - Buyer Requirements
   - Print - Site Visits
   - Print - Proposals

3. Clear Print Sheets
   Clears only the print sheets and keeps the original source data safe.

4. Archive Closed / Lost Records
   Moves closed, sold, rejected, lost, completed, or archived records from active sheets into archive sheets.
   Source records are removed only after being copied to the archive sheets.
   Archive activity is tracked in Archive Log.

Important:
- This package does not permanently delete active business data.
- Print sheets are temporary working sheets and can be regenerated any time.
- Archive sheets preserve old records for future reference.
